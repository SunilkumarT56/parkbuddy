import type { Response } from "express";
import type { AuthRequest } from "../../middlewares/auth.middleware";
import { prisma } from "../../config/postgresql.config";
import { uploadToS3, deleteFromS3 } from "../../services/s3.service";
import { generateToken } from "../../utils/jwt.utils";

export const createSpace = async (req: AuthRequest, res: Response) => {
  try {
    // 1️⃣ Auth check
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const ownerId = req.user.userId;

    // 2️⃣ Role check
    if (!req.user.roles?.includes("OWNER")) {
      return res.status(403).json({
        message: "Only owners can create parking spaces",
      });
    }

    const {
      title,
      description,
      address,
      city,
      state,
      pincode,
      latitude,
      longitude,
      pricePerHour,
      totalSlots,
    } = req.body;

    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({
        message: "At least one image is required",
      });
    }

    // 3️⃣ Parse numbers safely
    const parsedLatitude = parseFloat(latitude);
    const parsedLongitude = parseFloat(longitude);
    const parsedPrice = parseFloat(pricePerHour);
    const parsedSlots = parseInt(totalSlots);

    if (
      isNaN(parsedLatitude) ||
      isNaN(parsedLongitude) ||
      isNaN(parsedPrice) ||
      isNaN(parsedSlots)
    ) {
      return res.status(400).json({
        message: "Invalid numeric values provided",
      });
    }

    const imageUrls = await Promise.all(files.map((file) => uploadToS3(file)));
    const space = await prisma.$transaction(async (tx) => {
      const newSpace = await tx.parkingSpace.create({
        data: {
          ownerId,
          title,
          description,
          address,
          city,
          state,
          pincode,
          latitude: parsedLatitude,
          longitude: parsedLongitude,
          pricePerHour: parsedPrice,
          totalSlots: parsedSlots,
          availableSlots: parsedSlots,
          isActive: true,
        },
      });

      await tx.spotImage.createMany({
        data: imageUrls.map((url) => ({
          spaceId: newSpace.id,
          imageUrl: url,
        })),
      });

      return newSpace;
    });

    return res.status(201).json({
      success: true,
      message: "Space created successfully",
      space,
    });
  } catch (error) {
    console.error("Create space error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getMySpaces = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (!req.user.roles?.includes("OWNER")) {
      return res.status(403).json({
        message: "Only owners can access this resource",
      });
    }

    const ownerId = req.user.userId;

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const skip = (page - 1) * limit;

    const [spaces, total] = await Promise.all([
      prisma.parkingSpace.findMany({
        where: {
          ownerId,
        },
        include: {
          images: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),

      prisma.parkingSpace.count({
        where: {
          ownerId,
        },
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: spaces,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get my spaces error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const updateSpace = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!req.user.roles?.includes("OWNER")) {
      return res.status(403).json({
        message: "Only owners can update spaces",
      });
    }

    const ownerId = req.user.userId;
    const rawId = req.params.id;
    const spaceId =
      typeof rawId === "string"
        ? rawId
        : Array.isArray(rawId)
          ? rawId[0]
          : undefined;

    if (!spaceId) {
      return res.status(400).json({ message: "Invalid or missing space ID" });
    }

    // 1️⃣ Check if space exists and belongs to owner
    const existingSpace = await prisma.parkingSpace.findUnique({
      where: { id: spaceId },
    });

    if (!existingSpace) {
      return res.status(404).json({ message: "Space not found" });
    }

    if (existingSpace.ownerId !== ownerId) {
      return res.status(403).json({
        message: "You are not allowed to edit this space",
      });
    }

    // 2️⃣ Extract fields (partial update allowed)
    const {
      title,
      description,
      address,
      city,
      state,
      pincode,
      latitude,
      longitude,
      pricePerHour,
      totalSlots,
      isActive,
    } = req.body;

    // 3️⃣ Prepare update object dynamically
    const updateData: any = {};

    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (address) updateData.address = address;
    if (city) updateData.city = city;
    if (state) updateData.state = state;
    if (pincode) updateData.pincode = pincode;

    if (latitude) updateData.latitude = parseFloat(latitude);
    if (longitude) updateData.longitude = parseFloat(longitude);

    if (pricePerHour) {
      const parsedPrice = parseFloat(pricePerHour);
      if (parsedPrice <= 0)
        return res.status(400).json({ message: "Invalid price" });
      updateData.pricePerHour = parsedPrice;
    }

    if (totalSlots) {
      const parsedSlots = parseInt(totalSlots);
      if (parsedSlots <= 0)
        return res.status(400).json({ message: "Invalid total slots" });

      // Adjust availableSlots carefully
      const slotDifference = parsedSlots - existingSpace.totalSlots;

      updateData.totalSlots = parsedSlots;
      updateData.availableSlots = existingSpace.availableSlots + slotDifference;
    }

    if (typeof isActive === "boolean") {
      updateData.isActive = isActive;
    }

    // 4️⃣ Update space
    const updatedSpace = await prisma.parkingSpace.update({
      where: { id: spaceId },
      data: updateData,
      include: {
        images: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Space updated successfully",
      space: updatedSpace,
    });
  } catch (error) {
    console.error("Update space error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
export const deleteSpace = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!req.user.roles?.includes("OWNER")) {
      return res.status(403).json({
        message: "Only owners can delete spaces",
      });
    }

    const ownerId = req.user.userId;
    const rawId = req.params.id;
    const spaceId =
      typeof rawId === "string"
        ? rawId
        : Array.isArray(rawId)
          ? rawId[0]
          : undefined;

    if (!spaceId) {
      return res.status(400).json({ message: "Invalid or missing space ID" });
    }

    // 1️⃣ Check space exists
    const space = await prisma.parkingSpace.findUnique({
      where: { id: spaceId },
      include: { images: true },
    });

    if (!space) {
      return res.status(404).json({ message: "Space not found" });
    }

    // 2️⃣ Check ownership
    if (space.ownerId !== ownerId) {
      return res.status(403).json({
        message: "You are not allowed to delete this space",
      });
    }

    // 3️⃣ Delete S3 images first
    const images = (space as typeof space & { images: { imageUrl: string }[] })
      .images;
    await Promise.all(images.map((img) => deleteFromS3(img.imageUrl)));

    // 4️⃣ Delete DB records inside transaction
    await prisma.$transaction([
      prisma.spotImage.deleteMany({
        where: { spaceId },
      }),
      prisma.parkingSpace.delete({
        where: { id: spaceId },
      }),
    ]);

    return res.status(200).json({
      success: true,
      message: "Space deleted successfully",
    });
  } catch (error) {
    console.error("Delete space error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
export const switchRole = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { role } = req.body; // "DRIVER" or "OWNER"

    if (!role) {
      return res.status(400).json({
        message: "Role is required",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // 🔐 Check if user actually has that role
    if (!user.roles.includes(role)) {
      return res.status(403).json({
        message: "You do not have permission for this role",
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { currentRole: role },
    });

    // regenerate token
    const token = generateToken({
      userId: updatedUser.id,
      roles: updatedUser.roles,
      currentRole: updatedUser.currentRole!,
    });

    res.cookie("parkbuddy_token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: `Switched to ${role}`,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Switch role error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

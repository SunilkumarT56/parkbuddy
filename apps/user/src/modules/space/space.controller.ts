import type { Response } from "express";
import type { AuthRequest } from "../../middlewares/auth.middleware";
import { prisma } from "../../config/postgresql.config";
import { uploadToS3 } from "../../services/s3.service";

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

    const imageUrls = await Promise.all(
      files.map((file) => uploadToS3(file))
    );
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
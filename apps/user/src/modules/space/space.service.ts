import { prisma } from "../../config/postgresql.config";

interface CreateSpaceInput {
  ownerId: string;
  data: {
    title: string;
    description?: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    latitude: number;
    longitude: number;
    pricePerHour: number;
    totalSlots: number;
  };
}


export const createSpaceService = async ({
  ownerId,
  data,
}: CreateSpaceInput) => {
  return prisma.$transaction(async (tx) => {
    const space = await tx.parkingSpace.create({
      data: {
        ownerId,
        title: data.title,
        description: data.description,
        address: data.address,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        latitude: data.latitude,
        longitude: data.longitude,
        pricePerHour: data.pricePerHour,
        totalSlots: data.totalSlots,
        availableSlots: data.totalSlots, // important
        isActive: true,
      },
    });

    return space;
  });
};
import mongoose from "mongoose";
import z from "zod";

export const RoomTypeSchema = z.object({
    accommodationId: z.union([z.string().min(1), z.instanceof(mongoose.Types.ObjectId)]),
    name: z.string().min(1, "Room type name is required"),
    description: z.string().optional(),
    pricePerNight: z.number().positive("Price per night must be positive"),
    totalRooms: z.number().int().positive("Total rooms must be positive"),
    maxGuests: z.number().int().positive("Max guests must be positive"),
    isActive: z.boolean().default(true),
});

export type RoomType = z.infer<typeof RoomTypeSchema>;

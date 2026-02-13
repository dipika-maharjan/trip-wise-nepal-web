import { z } from "zod";

export const RoomTypeSchema = z.object({
    accommodationId: z.string().min(1, "Accommodation is required"),
    name: z.string().min(1, "Room type name is required").max(100, "Name too long"),
    description: z.string().optional(),
    pricePerNight: z.number().positive("Price must be positive"),
    maxGuests: z.number().int().positive("Max guests must be positive"),
    totalRooms: z.number().int().positive("Total rooms must be positive"),
    isActive: z.boolean(),
});

export type RoomTypeData = z.infer<typeof RoomTypeSchema>;

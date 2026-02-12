import z from "zod";
import { RoomTypeSchema } from "../types/roomType.type";

export const CreateRoomTypeDTO = RoomTypeSchema.pick({
    accommodationId: true,
    name: true,
    pricePerNight: true,
    totalRooms: true,
    maxGuests: true,
    isActive: true,
});

export type CreateRoomTypeDTO = z.infer<typeof CreateRoomTypeDTO>;

export const UpdateRoomTypeDTO = RoomTypeSchema.partial();
export type UpdateRoomTypeDTO = z.infer<typeof UpdateRoomTypeDTO>;

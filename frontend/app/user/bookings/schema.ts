import { z } from "zod";

const BookingExtraSchema = z.object({
    extraId: z.string().min(1, "Extra ID is required"),
    quantity: z.coerce.number().int().positive().optional(),
});

export const CreateBookingSchema = z.object({
    accommodationId: z.string().min(1, "Accommodation is required"),
    roomTypeId: z.string().min(1, "Room type is required"),
    checkIn: z.coerce.date(),
    checkOut: z.coerce.date(),
    guests: z.coerce.number().int().positive("At least 1 guest required"),
    roomsBooked: z.coerce.number().int().positive("At least 1 room required"),
    extras: z.array(BookingExtraSchema).optional(),
    specialRequest: z.string().optional(),
}).refine(data => data.checkOut > data.checkIn, {
    message: "Check-out must be after check-in",
    path: ["checkOut"],
});

export type CreateBookingData = z.infer<typeof CreateBookingSchema>;

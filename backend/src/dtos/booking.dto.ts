import z from "zod";

const BookingExtraRequestSchema = z.object({
    extraId: z.string().min(1, "Extra ID is required"),
    quantity: z.coerce.number().int().positive().optional(),
});

export const CreateBookingDTO = z.object({
    accommodationId: z.string().min(1, "Accommodation ID is required"),
    roomTypeId: z.string().min(1, "Room type ID is required"),
    checkIn: z.coerce.date(),
    checkOut: z.coerce.date(),
    guests: z.coerce.number().int().positive(),
    roomsBooked: z.coerce.number().int().positive(),
    extras: z.array(BookingExtraRequestSchema).optional(),
    specialRequest: z.string().optional(),
    paymentStatus: z.enum(["pending", "paid"]).optional(),
});

export const UpdateBookingDTO = z.object({
    roomTypeId: z.string().min(1, "Room type ID is required"),
    checkIn: z.coerce.date(),
    checkOut: z.coerce.date(),
    guests: z.coerce.number().int().positive(),
    roomsBooked: z.coerce.number().int().positive(),
    extras: z.array(BookingExtraRequestSchema).optional(),
    specialRequest: z.string().optional(),
});

export const UpdateBookingStatusDTO = z.object({
    bookingStatus: z.enum(["pending", "confirmed", "cancelled", "completed"]).optional(),
    paymentStatus: z.enum(["pending", "paid"]).optional(),
}).refine((data) => data.bookingStatus || data.paymentStatus, {
    message: "At least one of bookingStatus or paymentStatus is required",
});

export type CreateBookingDTO = z.infer<typeof CreateBookingDTO>;
export type UpdateBookingDTO = z.infer<typeof UpdateBookingDTO>;
export type UpdateBookingStatusDTO = z.infer<typeof UpdateBookingStatusDTO>;

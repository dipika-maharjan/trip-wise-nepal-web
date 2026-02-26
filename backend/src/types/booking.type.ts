import mongoose from "mongoose";
import z from "zod";

export const BookingSchema = z.object({
    userId: z.union([z.string().min(1), z.instanceof(mongoose.Types.ObjectId)]),
    accommodationId: z.union([z.string().min(1), z.instanceof(mongoose.Types.ObjectId)]),
    roomTypeId: z.union([z.string().min(1), z.instanceof(mongoose.Types.ObjectId)]),
    checkIn: z.coerce.date(),
    checkOut: z.coerce.date(),
    guests: z.number().int().positive("Guests must be at least 1"),
    roomsBooked: z.number().int().positive("Rooms booked must be at least 1"),
    nights: z.number().int().positive("Nights must be at least 1"),
    basePriceTotal: z.number().min(0),
    extrasTotal: z.number().min(0),
    tax: z.number().min(0),
    serviceFee: z.number().min(0),
    totalPrice: z.number().min(0),
    specialRequest: z.string().optional(),
    transaction_uuid: z.string().optional(),
    bookingStatus: z.enum(["pending", "confirmed", "cancelled", "completed"]).default("pending"),
    paymentStatus: z.enum(["pending", "paid"]).default("pending"),
});

export type Booking = z.infer<typeof BookingSchema>;

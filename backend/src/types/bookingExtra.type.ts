import mongoose from "mongoose";
import z from "zod";

export const BookingExtraSchema = z.object({
    bookingId: z.union([z.string().min(1), z.instanceof(mongoose.Types.ObjectId)]),
    extraId: z.union([z.string().min(1), z.instanceof(mongoose.Types.ObjectId)]),
    quantity: z.number().int().positive("Quantity must be at least 1"),
    totalPrice: z.number().min(0, "Total price must be non-negative"),
});

export type BookingExtra = z.infer<typeof BookingExtraSchema>;

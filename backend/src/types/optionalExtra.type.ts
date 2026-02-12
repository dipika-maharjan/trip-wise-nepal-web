import mongoose from "mongoose";
import z from "zod";

export const OptionalExtraSchema = z.object({
    accommodationId: z.union([z.string().min(1), z.instanceof(mongoose.Types.ObjectId)]),
    name: z.string().min(1, "Extra name is required"),
    description: z.string().optional(),
    price: z.number().min(0, "Price must be non-negative"),
    priceType: z.enum(["per_person", "per_booking"]),
    isActive: z.boolean().default(true),
});

export type OptionalExtra = z.infer<typeof OptionalExtraSchema>;

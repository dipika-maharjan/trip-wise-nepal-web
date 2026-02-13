import { z } from "zod";

export const OptionalExtraSchema = z.object({
    accommodationId: z.string().min(1, "Accommodation is required"),
    name: z.string().min(1, "Extra name is required").max(100, "Name too long"),
    description: z.string().optional(),
    price: z.number().positive("Price must be positive"),
    priceType: z.enum(["per_person", "per_booking"]),
    isActive: z.boolean(),
});

export type OptionalExtraData = z.infer<typeof OptionalExtraSchema>;

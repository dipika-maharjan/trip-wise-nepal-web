import mongoose from "mongoose";
import z from "zod";

export const AccommodationSchema = z.object({
    name: z.string().min(1, "Accommodation name is required"),
    address: z.string().min(1, "Address is required"),
    overview: z.string().min(1, "Overview is required"),
    images: z.array(z.string()).default([]),
    amenities: z.array(z.string()).default([]),
    ecoFriendlyHighlights: z.array(z.string()).default([]),
    pricePerNight: z.number().positive("Price must be positive"),
    maxGuests: z.number().optional(),
    rooms: z.number().optional(),
    bathrooms: z.number().optional(),
    location: z.object({
        lat: z.number(),
        lng: z.number(),
        address: z.string().optional(),
    }),
    rating: z.number().min(0).max(5).optional(),
    totalReviews: z.number().optional(),
    availableFrom: z.coerce.date().optional(),
    availableUntil: z.coerce.date().optional(),
    isActive: z.boolean().default(true),
    createdBy: z.union([
        z.string().min(1, "createdBy is required"),
        z.instanceof(mongoose.Types.ObjectId),
    ]),
});

export type AccommodationType = z.infer<typeof AccommodationSchema>;

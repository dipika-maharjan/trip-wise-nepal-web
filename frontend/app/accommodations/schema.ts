import z from 'zod';

export const AccommodationFilterSchema = z.object({
    minPrice: z.number().min(0).optional(),
    maxPrice: z.number().min(0).optional(),
    search: z.string().optional(),
    amenities: z.array(z.string()).optional(),
    rating: z.number().min(0).max(5).optional(),
});

export type AccommodationFilterSchema = z.infer<typeof AccommodationFilterSchema>;

export const AccommodationCreateSchema = z.object({
    name: z.string().min(1, "Name is required"),
    address: z.string().min(1, "Address is required"),
    overview: z.string().min(1, "Overview is required"),
    images: z.array(z.string()).min(1, "At least one image is required"),
    amenities: z.array(z.string()).optional(),
    ecoFriendlyHighlights: z.array(z.string()).optional(),
    rating: z.number().min(0).max(5).optional(),
    pricePerNight: z.number().positive("Price must be positive"),
    location: z.object({
        lat: z.number(),
        lng: z.number(),
        address: z.string().optional(),
    }),
    maxGuests: z.number().positive().optional(),
    rooms: z.number().positive().optional(),
    bathrooms: z.number().positive().optional(),
    availableFrom: z.string().optional(),
    availableTo: z.string().optional(),
    isActive: z.boolean().optional(),
});

export type AccommodationCreateSchema = z.infer<typeof AccommodationCreateSchema>;

import z from "zod";
import { AccommodationSchema } from "../types/accommodation.type";

export const CreateAccommodationDTO = AccommodationSchema.pick({
    name: true,
    address: true,
    overview: true,
    images: true,
    amenities: true,
    ecoFriendlyHighlights: true,
    maxGuests: true,
    rooms: true,
    bathrooms: true,
    location: true,
    availableFrom: true,
    availableUntil: true,
    isActive: true,
    pricePerNight: true,
});

export type CreateAccommodationDTO = z.infer<typeof CreateAccommodationDTO>;

export const UpdateAccommodationDTO = AccommodationSchema.partial();
export type UpdateAccommodationDTO = z.infer<typeof UpdateAccommodationDTO>;

export const GetAccommodationDTO = AccommodationSchema.pick({
    name: true,
    address: true,
    overview: true,
    images: true,
    amenities: true,
    ecoFriendlyHighlights: true,
    rating: true,
    totalReviews: true,
    location: true,
    maxGuests: true,
    rooms: true,
    bathrooms: true,
    availableFrom: true,
    availableUntil: true,
    isActive: true,
    createdBy: true,
});

export type GetAccommodationDTO = z.infer<typeof GetAccommodationDTO>;

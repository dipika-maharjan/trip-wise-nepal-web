import mongoose, { Schema, Document } from "mongoose";
import { AccommodationType } from "../types/accommodation.type";

type AccommodationDocument = Omit<AccommodationType, "createdBy"> & {
    createdBy: mongoose.Types.ObjectId;
};

const AccommodationSchema: Schema = new Schema<AccommodationDocument>(
    {
        name: { type: String, required: true },
        address: { type: String, required: true },
        overview: { type: String, required: true },
        images: { type: [String], default: [] },
        amenities: { type: [String], default: [] },
        ecoFriendlyHighlights: { type: [String], default: [] },
        pricePerNight: { type: Number, required: true },
        maxGuests: Number,
        rooms: Number,
        bathrooms: Number,
        location: {
            lat: { type: Number, required: true },
            lng: { type: Number, required: true },
            address: String,
        },
        rating: { type: Number, default: 0, min: 0, max: 5 },
        totalReviews: { type: Number, default: 0 },
        availableFrom: Date,
        availableUntil: Date,
        isActive: { type: Boolean, default: true },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

export interface IAccommodation extends AccommodationDocument, Document {
    _id: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export const AccommodationModel = mongoose.model<IAccommodation>(
    "Accommodation",
    AccommodationSchema
);

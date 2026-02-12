import mongoose, { Schema, Document } from "mongoose";
import { OptionalExtra } from "../types/optionalExtra.type";

type OptionalExtraDocument = Omit<OptionalExtra, "accommodationId"> & {
    accommodationId: mongoose.Types.ObjectId;
};

const OptionalExtraSchema: Schema = new Schema<OptionalExtraDocument>(
    {
        accommodationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Accommodation",
            required: true,
        },
        name: { type: String, required: true },
        description: { type: String },
        price: { type: Number, required: true },
        priceType: {
            type: String,
            enum: ["per_person", "per_booking"],
            required: true,
        },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export interface IOptionalExtra extends OptionalExtraDocument, Document {
    _id: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export const OptionalExtraModel = mongoose.model<IOptionalExtra>("OptionalExtra", OptionalExtraSchema);

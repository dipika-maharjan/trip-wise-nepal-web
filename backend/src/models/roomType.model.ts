import mongoose, { Schema, Document } from "mongoose";
import { RoomType } from "../types/roomType.type";

type RoomTypeDocument = Omit<RoomType, "accommodationId"> & {
    accommodationId: mongoose.Types.ObjectId;
};

const RoomTypeSchema: Schema = new Schema<RoomTypeDocument>(
    {
        accommodationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Accommodation",
            required: true,
        },
        name: { type: String, required: true },
        description: { type: String },
        pricePerNight: { type: Number, required: true },
        totalRooms: { type: Number, required: true },
        maxGuests: { type: Number, required: true },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export interface IRoomType extends RoomTypeDocument, Document {
    _id: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export const RoomTypeModel = mongoose.model<IRoomType>("RoomType", RoomTypeSchema);

import mongoose, { Schema, Document } from "mongoose";
import { BookingExtra } from "../types/bookingExtra.type";

type BookingExtraDocument = Omit<BookingExtra, "bookingId" | "extraId"> & {
    bookingId: mongoose.Types.ObjectId;
    extraId: mongoose.Types.ObjectId;
};

const BookingExtraSchema: Schema = new Schema<BookingExtraDocument>(
    {
        bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
        extraId: { type: mongoose.Schema.Types.ObjectId, ref: "OptionalExtra", required: true },
        quantity: { type: Number, required: true },
        totalPrice: { type: Number, required: true },
    },
    { timestamps: true }
);

export interface IBookingExtra extends BookingExtraDocument, Document {
    _id: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export const BookingExtraModel = mongoose.model<IBookingExtra>("BookingExtra", BookingExtraSchema);

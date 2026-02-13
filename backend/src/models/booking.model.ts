import mongoose, { Schema, Document } from "mongoose";
import { Booking } from "../types/booking.type";

type BookingDocument = Omit<Booking, "userId" | "accommodationId" | "roomTypeId"> & {
    userId: mongoose.Types.ObjectId;
    accommodationId: mongoose.Types.ObjectId;
    roomTypeId: mongoose.Types.ObjectId;
};

const BookingSchema: Schema = new Schema<BookingDocument>(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        accommodationId: { type: mongoose.Schema.Types.ObjectId, ref: "Accommodation", required: true },
        roomTypeId: { type: mongoose.Schema.Types.ObjectId, ref: "RoomType", required: true },
        checkIn: { type: Date, required: true },
        checkOut: { type: Date, required: true },
        guests: { type: Number, required: true },
        roomsBooked: { type: Number, required: true },
        nights: { type: Number, required: true },
        basePriceTotal: { type: Number, required: true },
        extrasTotal: { type: Number, required: true },
        tax: { type: Number, required: true },
        serviceFee: { type: Number, required: true },
        totalPrice: { type: Number, required: true },
        specialRequest: { type: String },
        bookingStatus: {
            type: String,
            enum: ["pending", "confirmed", "cancelled", "completed"],
            default: "pending",
        },
        paymentStatus: {
            type: String,
            enum: ["pending", "paid"],
            default: "pending",
        },
    },
    { timestamps: true }
);

BookingSchema.index({ checkIn: 1, checkOut: 1 });
BookingSchema.index({ accommodationId: 1 });
BookingSchema.index({ roomTypeId: 1 });

export interface IBooking extends BookingDocument, Document {
    _id: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export const BookingModel = mongoose.model<IBooking>("Booking", BookingSchema);

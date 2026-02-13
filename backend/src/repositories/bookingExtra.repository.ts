import { ClientSession } from "mongoose";
import { BookingExtraModel, IBookingExtra } from "../models/bookingExtra.model";

export class BookingExtraRepository {
    async createBookingExtras(
        extras: Partial<IBookingExtra>[],
        session?: ClientSession
    ): Promise<IBookingExtra[]> {
        return await BookingExtraModel.insertMany(extras, { session });
    }

    async getExtrasByBookingId(bookingId: string): Promise<IBookingExtra[]> {
        return await BookingExtraModel.find({ bookingId }).populate("extraId");
    }

    async deleteByBookingId(bookingId: string): Promise<void> {
        await BookingExtraModel.deleteMany({ bookingId });
    }
}


import mongoose, { ClientSession } from "mongoose";
import { BookingModel, IBooking } from "../models/booking.model";

export class BookingRepository {

        async getUserOverlappingBookings(
            userId: string,
            accommodationId: string,
            checkIn: Date,
            checkOut: Date
        ): Promise<IBooking[]> {
            return await BookingModel.find({
                userId: new mongoose.Types.ObjectId(userId),
                accommodationId: new mongoose.Types.ObjectId(accommodationId),
                bookingStatus: { $ne: "cancelled" },
                checkIn: { $lt: checkOut },
                checkOut: { $gt: checkIn },
            });
        }
    async createBooking(data: Partial<IBooking>, session?: ClientSession): Promise<IBooking> {
        const booking = new BookingModel(data);
        return await booking.save({ session });
    }

    async getBookingById(id: string): Promise<IBooking | null> {
        return await BookingModel.findById(id)
            .populate("accommodationId")
            .populate("roomTypeId")
            .populate("userId");
    }

    async getUserBookings(userId: string): Promise<IBooking[]> {
        return await BookingModel.find({ userId })
            .populate("accommodationId")
            .populate("roomTypeId")
            .sort({ createdAt: -1 });
    }

    async updateBookingStatus(id: string, bookingStatus: string): Promise<IBooking | null> {
        return await BookingModel.findByIdAndUpdate(id, { bookingStatus }, { new: true });
    }

    async updateBookingFields(
        id: string,
        fields: Partial<IBooking>
    ): Promise<IBooking | null> {
        return await BookingModel.findByIdAndUpdate(id, fields, { new: true });
    }

    async deleteBooking(id: string): Promise<boolean> {
        const result = await BookingModel.findByIdAndDelete(id);
        return result !== null;
    }

    async getAllBookings(): Promise<IBooking[]> {
        return await BookingModel.find({})
            .populate("accommodationId")
            .populate("roomTypeId")
            .populate("userId")
            .sort({ createdAt: -1 });
    }

    async getOverlappingBookings(
        roomTypeId: string,
        checkIn: Date,
        checkOut: Date,
        session?: ClientSession
    ): Promise<IBooking[]> {
        return await BookingModel.find({
            roomTypeId: new mongoose.Types.ObjectId(roomTypeId),
            bookingStatus: { $ne: "cancelled" },
            checkIn: { $lt: checkOut },
            checkOut: { $gt: checkIn },
        }).session(session ?? null);
    }

    async getBookedRoomsCount(
        roomTypeId: string,
        checkIn: Date,
        checkOut: Date,
        session?: ClientSession,
        excludeBookingId?: string
    ): Promise<number> {
        const match: Record<string, any> = {
            roomTypeId: new mongoose.Types.ObjectId(roomTypeId),
            bookingStatus: { $ne: "cancelled" },
            checkIn: { $lt: checkOut },
            checkOut: { $gt: checkIn },
        };

        if (excludeBookingId) {
            match._id = { $ne: new mongoose.Types.ObjectId(excludeBookingId) };
        }

        const result = await BookingModel.aggregate([
            {
                $match: match,
            },
            {
                $group: {
                    _id: null,
                    totalRooms: { $sum: "$roomsBooked" },
                },
            },
        ]).session(session ?? null);

        return result.length > 0 ? result[0].totalRooms : 0;
    }
}

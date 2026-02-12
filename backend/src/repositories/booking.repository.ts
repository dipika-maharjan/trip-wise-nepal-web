import mongoose, { ClientSession } from "mongoose";
import { BookingModel, IBooking } from "../models/booking.model";

export class BookingRepository {
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
        session?: ClientSession
    ): Promise<number> {
        const result = await BookingModel.aggregate([
            {
                $match: {
                    roomTypeId: new mongoose.Types.ObjectId(roomTypeId),
                    bookingStatus: { $ne: "cancelled" },
                    checkIn: { $lt: checkOut },
                    checkOut: { $gt: checkIn },
                },
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

import { Request, Response } from "express";
import { BookingService } from "../services/booking.service";
import { CreateBookingDTO, UpdateBookingStatusDTO, UpdateBookingDTO } from "../dtos/booking.dto";
import z from "zod";

const bookingService = new BookingService();

export class BookingController {
    createBooking = async (req: Request, res: Response) => {
        try {
            const normalizedBody = {
                ...req.body,
                roomsBooked: req.body.roomsBooked ?? req.body.rooms,
            };

            const parseData = CreateBookingDTO.safeParse(normalizedBody);
            if (!parseData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(parseData.error),
                });
            }

            const userId = (req.user as { _id?: string } | undefined)?._id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            const result = await bookingService.createBooking(parseData.data, String(userId));
            return res.status(201).json({
                success: true,
                message: "Booking created successfully",
                data: result,
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Failed to create booking",
            });
        }
    };

    getBookingById = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const bookingData = await bookingService.getBookingById(id);

            const user = req.user as { _id?: string; role?: string } | undefined;
            const isOwner = user?._id && String((bookingData.booking as any).userId?._id || (bookingData.booking as any).userId) === String(user._id);
            const isAdmin = user?.role === "admin";

            if (!isOwner && !isAdmin) {
                return res.status(403).json({ success: false, message: "Forbidden" });
            }

            return res.status(200).json({ success: true, data: bookingData });
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Failed to fetch booking",
            });
        }
    };

    getMyBookings = async (req: Request, res: Response) => {
        try {
            const userId = (req.user as { _id?: string } | undefined)?._id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            const bookings = await bookingService.getUserBookings(String(userId));
            return res.status(200).json({ success: true, data: bookings });
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Failed to fetch bookings",
            });
        }
    };

    getAllBookings = async (req: Request, res: Response) => {
        try {
            const user = req.user as { role?: string } | undefined;
            if (user?.role !== "admin") {
                return res.status(403).json({ success: false, message: "Forbidden" });
            }

            const bookings = await bookingService.getAllBookings();
            return res.status(200).json({ success: true, data: bookings });
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Failed to fetch bookings",
            });
        }
    };

    cancelBooking = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const bookingData = await bookingService.getBookingById(id);

            const user = req.user as { _id?: string; role?: string } | undefined;
            const isOwner = user?._id && String((bookingData.booking as any).userId?._id || (bookingData.booking as any).userId) === String(user._id);
            const isAdmin = user?.role === "admin";

            if (!isOwner && !isAdmin) {
                return res.status(403).json({ success: false, message: "Forbidden" });
            }

            const updated = await bookingService.cancelBooking(id);
            return res.status(200).json({
                success: true,
                message: "Booking cancelled successfully",
                data: updated,
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Failed to cancel booking",
            });
        }
    };

    updateBookingStatuses = async (req: Request, res: Response) => {
        try {
            const user = req.user as { role?: string } | undefined;
            if (user?.role !== "admin") {
                return res.status(403).json({ success: false, message: "Forbidden" });
            }

            const { id } = req.params;
            const parseData = UpdateBookingStatusDTO.safeParse(req.body);
            if (!parseData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(parseData.error),
                });
            }

            const updated = await bookingService.updateBookingStatuses(id, parseData.data);
            return res.status(200).json({
                success: true,
                message: "Booking updated successfully",
                data: updated,
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Failed to update booking",
            });
        }
    };

    deleteBooking = async (req: Request, res: Response) => {
        try {
            const user = req.user as { role?: string } | undefined;
            if (user?.role !== "admin") {
                return res.status(403).json({ success: false, message: "Forbidden" });
            }

            const { id } = req.params;
            const result = await bookingService.deleteBooking(id);
            return res.status(200).json({ success: true, message: result.message });
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Failed to delete booking",
            });
        }
    };

    updateBooking = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const parseData = UpdateBookingDTO.safeParse(req.body);
            if (!parseData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(parseData.error),
                });
            }

            const bookingData = await bookingService.getBookingById(id);
            const user = req.user as { _id?: string; role?: string } | undefined;
            const isOwner = user?._id && String((bookingData.booking as any).userId?._id || (bookingData.booking as any).userId) === String(user._id);
            const isAdmin = user?.role === "admin";

            if (!isOwner && !isAdmin) {
                return res.status(403).json({ success: false, message: "Forbidden" });
            }

            const updated = await bookingService.updateBooking(id, parseData.data as any);
            return res.status(200).json({
                success: true,
                message: "Booking updated successfully",
                data: updated,
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Failed to update booking",
            });
        }
    };
}

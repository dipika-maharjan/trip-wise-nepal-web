import mongoose from "mongoose";
import { BookingRepository } from "../repositories/booking.repository";
import { BookingExtraRepository } from "../repositories/bookingExtra.repository";
import { RoomTypeRepository } from "../repositories/roomType.repository";
import { OptionalExtraRepository } from "../repositories/optionalExtra.repository";
import { AccommodationRepository } from "../repositories/accommodation.repository";
import { CreateBookingDTO, UpdateBookingDTO } from "../dtos/booking.dto";
import { HttpError } from "../errors/http-error";
import { TAX_PERCENT, SERVICE_FEE } from "../config";

const bookingRepository = new BookingRepository();
const bookingExtraRepository = new BookingExtraRepository();
const roomTypeRepository = new RoomTypeRepository();
const optionalExtraRepository = new OptionalExtraRepository();
const accommodationRepository = new AccommodationRepository();

const MS_PER_DAY = 1000 * 60 * 60 * 24;

// In-memory lock to prevent race conditions during booking creation
// Key format: roomTypeId:checkIn:checkOut
const bookingLocks: Record<string, boolean> = {};

const roundToTwo = (value: number) => Math.round(value * 100) / 100;

const calculateNights = (checkIn: Date, checkOut: Date): number => {
  const diff = checkOut.getTime() - checkIn.getTime();
  return Math.ceil(diff / MS_PER_DAY);
};

export class BookingService {
  async createBooking(data: CreateBookingDTO, userId: string) {
    // Create a unique lock key for this room type and date range
    const lockKey = `${data.roomTypeId}:${data.checkIn}:${data.checkOut}`;

    // Check if another booking is being processed for the same room type and dates
    if (bookingLocks[lockKey]) {
      throw new HttpError(
        409,
        "Another booking is being processed for these dates. Please try again in a moment.",
      );
    }

    // Acquire the lock
    bookingLocks[lockKey] = true;

    try {
      // Duplicate booking prevention: block same user, same accommodation, overlapping dates
      const overlapping = await bookingRepository.getUserOverlappingBookings(
        userId,
        data.accommodationId,
        new Date(data.checkIn),
        new Date(data.checkOut)
      );
      if (overlapping.length > 0) {
        throw new HttpError(409, "You already have a booking for these dates at this accommodation.");
      }
      const accommodation = await accommodationRepository.getAccommodationById(
        data.accommodationId,
      );
      if (!accommodation || !accommodation.isActive) {
        throw new HttpError(404, "Accommodation not found or inactive");
      }

      const roomType = await roomTypeRepository.getRoomTypeById(
        data.roomTypeId,
      );
      if (!roomType || !roomType.isActive) {
        throw new HttpError(404, "Room type not found or inactive");
      }

      if (String(roomType.accommodationId) !== String(accommodation._id)) {
        throw new HttpError(
          400,
          "Room type does not belong to this accommodation",
        );
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const checkIn = new Date(data.checkIn);
      const checkOut = new Date(data.checkOut);

      if (checkIn < today) {
        throw new HttpError(400, "Check-in date cannot be in the past");
      }
      if (checkOut <= checkIn) {
        throw new HttpError(400, "Check-out date must be after check-in date");
      }

      const nights = calculateNights(checkIn, checkOut);
      if (nights < 1) {
        throw new HttpError(400, "Booking must be at least 1 night");
      }

      const maxGuestsAllowed = roomType.maxGuests * data.roomsBooked;
      if (data.guests > maxGuestsAllowed) {
        throw new HttpError(
          400,
          `Guest count exceeds maximum allowed (${maxGuestsAllowed})`,
        );
      }

      const bookedRooms = await bookingRepository.getBookedRoomsCount(
        data.roomTypeId,
        checkIn,
        checkOut,
      );
      const availableRooms = roomType.totalRooms - bookedRooms;
      if (data.roomsBooked > availableRooms) {
        throw new HttpError(
          400,
          `Only ${availableRooms} room(s) available for selected dates`,
        );
      }

      const basePriceTotal = roundToTwo(
        roomType.pricePerNight * nights * data.roomsBooked,
      );

      let extrasTotal = 0;
      const bookingExtrasPayload: {
        extraId: string;
        quantity: number;
        totalPrice: number;
      }[] = [];

      if (data.extras && data.extras.length > 0) {
        for (const extraRequest of data.extras) {
          const extra = await optionalExtraRepository.getOptionalExtraById(
            extraRequest.extraId,
          );
          if (!extra || !extra.isActive) {
            throw new HttpError(404, "Optional extra not found or inactive");
          }
          if (String(extra.accommodationId) !== String(accommodation._id)) {
            throw new HttpError(
              400,
              "Optional extra does not belong to this accommodation",
            );
          }

          // Validate quantity: must be positive and not excessive
          const quantity =
            extraRequest.quantity && extraRequest.quantity > 0
              ? extraRequest.quantity
              : 1;
          if (quantity > 100) {
            throw new HttpError(400, "Extras quantity too large");
          }

          let extraTotal = 0;
          if (extra.priceType === "per_person") {
            extraTotal = extra.price * data.guests * quantity; // multiply by guests and quantity
          } else {
            extraTotal = extra.price * quantity; // multiply by quantity only
          }

          extraTotal = roundToTwo(extraTotal);
          extrasTotal += extraTotal;

          bookingExtrasPayload.push({
            extraId: String(extra._id),
            quantity,
            totalPrice: extraTotal,
          });
        }
      }

      extrasTotal = roundToTwo(extrasTotal);
      const tax = roundToTwo(
        (basePriceTotal + extrasTotal) * (TAX_PERCENT / 100),
      );
      const serviceFee = roundToTwo(SERVICE_FEE);
      const totalPrice = roundToTwo(
        basePriceTotal + extrasTotal + tax + serviceFee,
      );

      const newBooking = await bookingRepository.createBooking({
        userId: new mongoose.Types.ObjectId(userId),
        accommodationId: accommodation._id,
        roomTypeId: roomType._id,
        checkIn,
        checkOut,
        guests: data.guests,
        roomsBooked: data.roomsBooked,
        nights,
        basePriceTotal,
        extrasTotal,
        tax,
        serviceFee,
        totalPrice,
        specialRequest: data.specialRequest,
        bookingStatus: "pending",
        paymentStatus: data.paymentStatus ?? "pending",
      });

      if (bookingExtrasPayload.length > 0) {
        await bookingExtraRepository.createBookingExtras(
          bookingExtrasPayload.map((item) => ({
            ...item,
            bookingId: newBooking._id,
            extraId: new mongoose.Types.ObjectId(item.extraId),
          })),
        );
      }

      const extras = await bookingExtraRepository.getExtrasByBookingId(
        String(newBooking._id),
      );

      return {
        booking: newBooking,
        priceSummary: {
          roomType: roomType.name,
          nights,
          rooms: data.roomsBooked,
          basePriceTotal,
          extras: extras.map((item) => ({
            name: (item.extraId as any).name,
            quantity: item.quantity,
            total: item.totalPrice,
          })),
          extrasTotal,
          tax,
          serviceFee,
          totalPrice,
        },
      };
    } catch (error: Error | any) {
      if (error instanceof HttpError) throw error;
      throw new HttpError(500, error.message || "Failed to create booking");
    } finally {
      // Always release the lock, even if an error occurred
      delete bookingLocks[lockKey];
    }
  }

  async getBookingById(id: string) {
    try {
      const booking = await bookingRepository.getBookingById(id);
      if (!booking) {
        throw new HttpError(404, "Booking not found");
      }

      const extras = await bookingExtraRepository.getExtrasByBookingId(
        String(booking._id),
      );

      return {
        booking,
        extras: extras.map((item) => ({
          extraId: (item.extraId as any)?._id ?? item.extraId,
          name: (item.extraId as any).name,
          quantity: item.quantity,
          total: item.totalPrice,
        })),
      };
    } catch (error: Error | any) {
      if (error instanceof HttpError) throw error;
      throw new HttpError(500, error.message || "Failed to fetch booking");
    }
  }

  async getUserBookings(userId: string) {
    try {
      return await bookingRepository.getUserBookings(userId);
    } catch (error: Error | any) {
      throw new HttpError(
        500,
        error.message || "Failed to fetch user bookings",
      );
    }
  }

  async getAllBookings() {
    try {
      return await bookingRepository.getAllBookings();
    } catch (error: Error | any) {
      throw new HttpError(500, error.message || "Failed to fetch bookings");
    }
  }

  async updateBookingStatuses(
    id: string,
    data: {
      bookingStatus?: "pending" | "confirmed" | "cancelled" | "completed";
      paymentStatus?: "pending" | "paid";
    },
  ) {
    try {
      const booking = await bookingRepository.getBookingById(id);
      if (!booking) {
        throw new HttpError(404, "Booking not found");
      }

      const updated = await bookingRepository.updateBookingFields(id, data);
      if (!updated) {
        throw new HttpError(500, "Failed to update booking");
      }
      return updated;
    } catch (error: Error | any) {
      if (error instanceof HttpError) throw error;
      throw new HttpError(500, error.message || "Failed to update booking");
    }
  }

  async cancelBooking(id: string) {
    try {
      const booking = await bookingRepository.getBookingById(id);
      if (!booking) {
        throw new HttpError(404, "Booking not found");
      }
      if (booking.bookingStatus === "cancelled") {
        throw new HttpError(400, "Booking already cancelled");
      }
      if (
        booking.bookingStatus !== "pending" &&
        booking.bookingStatus !== "confirmed"
      ) {
        throw new HttpError(
          400,
          "Only pending or confirmed bookings can be cancelled",
        );
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (booking.checkIn && new Date(booking.checkIn) <= today) {
        throw new HttpError(
          400,
          "Cannot cancel a booking on or after check-in date",
        );
      }

      const updatedBooking = await bookingRepository.updateBookingStatus(
        id,
        "cancelled",
      );
      return updatedBooking;
    } catch (error: Error | any) {
      if (error instanceof HttpError) throw error;
      throw new HttpError(500, error.message || "Failed to cancel booking");
    }
  }

  async deleteBooking(id: string) {
    try {
      const booking = await bookingRepository.getBookingById(id);
      if (!booking) {
        throw new HttpError(404, "Booking not found");
      }

      await bookingExtraRepository.deleteByBookingId(String(booking._id));
      const deleted = await bookingRepository.deleteBooking(id);
      if (!deleted) {
        throw new HttpError(500, "Failed to delete booking");
      }
      return { message: "Booking deleted successfully" };
    } catch (error: Error | any) {
      if (error instanceof HttpError) throw error;
      throw new HttpError(500, error.message || "Failed to delete booking");
    }
  }

  async updateBooking(id: string, data: UpdateBookingDTO) {
    try {
      const booking = await bookingRepository.getBookingById(id);
      if (!booking) {
        throw new HttpError(404, "Booking not found");
      }
      if (
        booking.bookingStatus === "cancelled" ||
        booking.bookingStatus === "completed"
      ) {
        throw new HttpError(
          400,
          "Cannot edit a cancelled or completed booking",
        );
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (booking.checkIn && new Date(booking.checkIn) <= today) {
        throw new HttpError(
          400,
          "Cannot edit a booking on or after check-in date",
        );
      }

      const accommodationId =
        typeof booking.accommodationId === "object"
          ? (booking.accommodationId as any)?._id
          : booking.accommodationId;
      const accommodation = await accommodationRepository.getAccommodationById(
        String(accommodationId),
      );
      if (!accommodation || !accommodation.isActive) {
        throw new HttpError(404, "Accommodation not found or inactive");
      }

      const roomType = await roomTypeRepository.getRoomTypeById(
        data.roomTypeId,
      );
      if (!roomType || !roomType.isActive) {
        throw new HttpError(404, "Room type not found or inactive");
      }

      if (String(roomType.accommodationId) !== String(accommodation._id)) {
        throw new HttpError(
          400,
          "Room type does not belong to this accommodation",
        );
      }

      const checkIn = new Date(data.checkIn);
      const checkOut = new Date(data.checkOut);

      if (checkIn < today) {
        throw new HttpError(400, "Check-in date cannot be in the past");
      }
      if (checkOut <= checkIn) {
        throw new HttpError(400, "Check-out date must be after check-in date");
      }

      const nights = calculateNights(checkIn, checkOut);
      if (nights < 1) {
        throw new HttpError(400, "Booking must be at least 1 night");
      }

      const maxGuestsAllowed = roomType.maxGuests * data.roomsBooked;
      if (data.guests > maxGuestsAllowed) {
        throw new HttpError(
          400,
          `Guest count exceeds maximum allowed (${maxGuestsAllowed})`,
        );
      }

      const bookedRooms = await bookingRepository.getBookedRoomsCount(
        data.roomTypeId,
        checkIn,
        checkOut,
        undefined,
        String(booking._id),
      );
      const availableRooms = roomType.totalRooms - bookedRooms;
      if (data.roomsBooked > availableRooms) {
        throw new HttpError(
          400,
          `Only ${availableRooms} room(s) available for selected dates`,
        );
      }

      const basePriceTotal = roundToTwo(
        roomType.pricePerNight * nights * data.roomsBooked,
      );

      let extrasTotal = 0;
      const bookingExtrasPayload: {
        extraId: string;
        quantity: number;
        totalPrice: number;
      }[] = [];

      if (data.extras && data.extras.length > 0) {
        for (const extraRequest of data.extras) {
          const extra = await optionalExtraRepository.getOptionalExtraById(
            extraRequest.extraId,
          );
          if (!extra || !extra.isActive) {
            throw new HttpError(404, "Optional extra not found or inactive");
          }
          if (String(extra.accommodationId) !== String(accommodation._id)) {
            throw new HttpError(
              400,
              "Optional extra does not belong to this accommodation",
            );
          }

          const quantity =
            extraRequest.quantity && extraRequest.quantity > 0
              ? extraRequest.quantity
              : 1;
          let extraTotal = 0;

          if (extra.priceType === "per_person") {
            extraTotal = extra.price * data.guests * quantity;
          } else {
            extraTotal = extra.price * quantity;
          }

          extraTotal = roundToTwo(extraTotal);
          extrasTotal += extraTotal;

          bookingExtrasPayload.push({
            extraId: String(extra._id),
            quantity,
            totalPrice: extraTotal,
          });
        }
      }

      extrasTotal = roundToTwo(extrasTotal);
      const tax = roundToTwo(
        (basePriceTotal + extrasTotal) * (TAX_PERCENT / 100),
      );
      const serviceFee = roundToTwo(SERVICE_FEE);
      const totalPrice = roundToTwo(
        basePriceTotal + extrasTotal + tax + serviceFee,
      );

      const updatedBooking = await bookingRepository.updateBookingFields(id, {
        roomTypeId: roomType._id,
        checkIn,
        checkOut,
        guests: data.guests,
        roomsBooked: data.roomsBooked,
        nights,
        basePriceTotal,
        extrasTotal,
        tax,
        serviceFee,
        totalPrice,
        specialRequest: data.specialRequest,
      } as any);

      if (!updatedBooking) {
        throw new HttpError(500, "Failed to update booking");
      }

      await bookingExtraRepository.deleteByBookingId(String(booking._id));
      if (bookingExtrasPayload.length > 0) {
        await bookingExtraRepository.createBookingExtras(
          bookingExtrasPayload.map((item) => ({
            ...item,
            bookingId: booking._id,
            extraId: new mongoose.Types.ObjectId(item.extraId),
          })),
        );
      }

      return updatedBooking;
    } catch (error: Error | any) {
      if (error instanceof HttpError) throw error;
      throw new HttpError(500, error.message || "Failed to update booking");
    }
  }
}
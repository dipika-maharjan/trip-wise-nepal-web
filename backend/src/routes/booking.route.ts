import { Router } from "express";
import { BookingController } from "../controllers/booking.controller";
import { authorizedMiddleware } from "../middleware/authorization.middleware";

const router = Router();
const bookingController = new BookingController();

router.post("/", authorizedMiddleware, bookingController.createBooking);
router.get("/my-bookings", authorizedMiddleware, bookingController.getMyBookings);
router.get("/:id", authorizedMiddleware, bookingController.getBookingById);
router.patch("/:id/cancel", authorizedMiddleware, bookingController.cancelBooking);

export default router;

import { BookingModel } from '../models/booking.model';
import { UserModel } from '../models/user.model';
import { AccommodationModel } from '../models/accommodation.model';
import { RoomTypeModel } from '../models/roomType.model';
import { sendEmail } from './email';

export const sendPaymentSuccessEmail = async (booking: any) => {
  try {
    const user = await UserModel.findById(booking.userId);
    const accommodation = await AccommodationModel.findById(booking.accommodationId);
    const roomType = await RoomTypeModel.findById(booking.roomTypeId);
    if (user && user.email && roomType && accommodation && booking.checkIn && booking.checkOut && typeof booking.totalPrice !== 'undefined') {
      const subject = 'Payment Successful - Trip Wise Nepal';
      const html = `
        <h2>Thank you for your payment!</h2>
        <p>Dear ${user.name},</p>
        <p>Your payment for booking at <strong>${accommodation.name}</strong> is successful and confirmed.</p>
        <ul>
          <li><strong>Room Type:</strong> ${roomType.name}</li>
          <li><strong>Check-in:</strong> ${new Date(booking.checkIn).toDateString()}</li>
          <li><strong>Check-out:</strong> ${new Date(booking.checkOut).toDateString()}</li>
          <li><strong>Guests:</strong> ${booking.guests}</li>
          <li><strong>Rooms Booked:</strong> ${booking.roomsBooked}</li>
          <li><strong>Total Price:</strong> Rs ${booking.totalPrice}</li>
          <li><strong>Special Requests:</strong> ${booking.specialRequest ? booking.specialRequest : 'None'}</li>
        </ul>
        <p>We look forward to hosting you!</p>
        <p>Trip Wise Nepal Team</p>
      `;
      await sendEmail(user.email, subject, html);
    }
  } catch (emailErr) {
    console.error('Failed to send payment success email:', emailErr);
  }
};

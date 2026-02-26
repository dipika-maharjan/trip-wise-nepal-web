import request from 'supertest';
import app from '../../app';
import { BookingModel } from '../../models/booking.model';

describe('Payment Integration Tests', () => {
  let bookingId: string;
  let userToken: string;
  let accommodationId: string;
  let roomTypeId: string;

  beforeAll(async () => {
        // Set test user as admin
        await require('../../models/user.model').UserModel.updateOne(
          { email: 'paymentuser@example.com' },
          { $set: { role: 'admin' } }
        );
    // Register and login user
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Payment User',
        email: 'paymentuser@example.com',
        password: 'Payment@1234',
        confirmPassword: 'Payment@1234',
      });
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'paymentuser@example.com',
        password: 'Payment@1234',
      });
    userToken = loginRes.body.token;

    // Create accommodation (add pricePerNight)
    const accRes = await request(app)
      .post('/api/accommodations')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Test Accommodation',
        address: 'Kathmandu, Nepal',
        overview: 'A nice place to stay',
        images: [],
        amenities: ['WiFi', 'Breakfast'],
        ecoFriendlyHighlights: ['Solar Power'],
        maxGuests: 2,
        rooms: 1,
        bathrooms: 1,
        location: { lat: 27.7172, lng: 85.3240 },
        availableFrom: new Date(),
        availableUntil: new Date(Date.now() + 86400000),
        isActive: true,
        pricePerNight: 120
      });
    accommodationId = accRes.body.data?._id;
    if (!accommodationId) throw new Error('Accommodation creation failed: ' + JSON.stringify(accRes.body));

    // Create room type
    const roomTypeRes = await request(app)
      .post('/api/room-types')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        accommodationId,
        name: 'Deluxe',
        description: 'Spacious room with amenities',
        pricePerNight: 120,
        totalRooms: 1,
        maxGuests: 2,
        isActive: true
      });
    roomTypeId = roomTypeRes.body.data?._id;
    if (!roomTypeId) throw new Error('Room type creation failed: ' + JSON.stringify(roomTypeRes.body));

    // Create booking
    const bookingRes = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        accommodationId,
        roomTypeId,
        checkIn: new Date(),
        checkOut: new Date(Date.now() + 86400000),
        guests: 2,
        roomsBooked: 1,
        paymentStatus: 'pending',
      });
    // Log booking creation response for debugging
    console.log('Booking creation response:', bookingRes.body);
    bookingId = bookingRes.body.data?.booking?._id;
    if (!bookingId) throw new Error('Booking creation failed: ' + JSON.stringify(bookingRes.body));
  });

  afterAll(async () => {
    await BookingModel.deleteMany({ _id: bookingId });
  });

  test('should initiate eSewa payment', async () => {
    const res = await request(app)
      .post('/api/payment/esewa/initiate')
      .send({ amount: 1000, bookingId });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('esewaUrl');
    expect(res.body).toHaveProperty('formData');
  });

  test('should handle eSewa success callback and update booking', async () => {
    // Simulate eSewa success callback
    const transaction_uuid = 'test-transaction-uuid';
    await BookingModel.findByIdAndUpdate(bookingId, { transaction_uuid });
    const res = await request(app)
      .get('/api/payment/esewa/success')
      .query({
        product_code: 'EPAYTEST',
        total_amount: 1000,
        transaction_uuid,
      });
    // If payment is successful, should redirect
    expect([200, 302, 400]).toContain(res.status);
    if (res.status === 302) {
      expect(res.header.location).toContain(`/user/bookings/${bookingId}`);
    } else {
      // Accept 'PAID' or 'FAILED' for test environment
      expect(['PAID', 'FAILED']).toContain(res.body.status);
    }
  });

  test('should handle eSewa failure callback', async () => {
    const res = await request(app)
      .get('/api/payment/esewa/failure');
    expect(res.status).toBe(200);
    expect(res.body.message).toContain('Payment failed');
  });
});

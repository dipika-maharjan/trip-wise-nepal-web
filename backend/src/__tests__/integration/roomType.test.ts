import request from 'supertest';
import app from '../../app';
import { RoomTypeModel } from '../../models/roomType.model';
import { UserModel } from '../../models/user.model';

describe('Room Type Integration Tests', () => {
    let adminToken: string;
    let roomTypeId: string;

    const adminCredentials = {
        email: 'admin@example.com',
        password: 'Admin@1234'
    };

    let accommodationId: string;
    const newRoomType = {
        name: 'Deluxe',
        description: 'Spacious room with amenities',
        pricePerNight: 120,
        totalRooms: 1,
        maxGuests: 2,
        isActive: true
    };

    // Duplicate declaration removed
    beforeAll(async () => {
        await UserModel.deleteMany({ email: adminCredentials.email });
        await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Admin',
                email: adminCredentials.email,
                password: adminCredentials.password,
                confirmPassword: adminCredentials.password
            });
        await UserModel.updateOne(
            { email: adminCredentials.email },
            { $set: { role: 'admin' } }
        );
        const loginRes = await request(app)
            .post('/api/auth/login')
            .send(adminCredentials);
        adminToken = loginRes.body.token;
        // Create accommodation for room type
        const accRes = await request(app)
            .post('/api/accommodations')
            .set('Authorization', `Bearer ${adminToken}`)
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
                pricePerNight: 100
            });
        accommodationId = accRes.body.data?._id;
        await RoomTypeModel.deleteMany({ name: newRoomType.name });
    });

    afterAll(async () => {
        await RoomTypeModel.deleteMany({ name: newRoomType.name });
    });

    describe('POST /api/room-types', () => {
                test('should fail to create room type with missing name', async () => {
                    const res = await request(app)
                        .post('/api/room-types')
                        .set('Authorization', `Bearer ${adminToken}`)
                        .send({
                            accommodationId,
                            description: 'No name',
                            pricePerNight: 120,
                            totalRooms: 1,
                            maxGuests: 2,
                            isActive: true
                        });
                    expect(res.status).toBe(400);
                });
                test('should fail to create room type without authorization', async () => {
                    const res = await request(app)
                        .post('/api/room-types')
                        .send({ ...newRoomType, accommodationId });
                    expect([401,403]).toContain(res.status);
                });
        test('should create a new room type', async () => {
            const res = await request(app)
                .post('/api/room-types')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ ...newRoomType, accommodationId });
            expect(res.status).toBe(201);
            expect(res.body.data.name).toBe(newRoomType.name);
            roomTypeId = res.body.data._id;
        });
    });

    describe('GET /api/room-types', () => {
        test('should get all room types', async () => {
            const res = await request(app)
                .get('/api/room-types');
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    describe('GET /api/room-types/:id', () => {
        test('should get room type by ID', async () => {
            const res = await request(app)
                .get(`/api/room-types/${roomTypeId}`);
            expect(res.status).toBe(200);
            expect(res.body.data._id).toBe(roomTypeId);
        });
    });

    describe('PUT /api/room-types/:id', () => {
        test('should update room type', async () => {
            const res = await request(app)
                .put(`/api/room-types/${roomTypeId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ pricePerNight: 150 });
            expect(res.status).toBe(200);
            expect(res.body.data.pricePerNight).toBe(150);
        });
    });

    describe('DELETE /api/room-types/:id', () => {
        test('should delete room type', async () => {
            const res = await request(app)
                .delete(`/api/room-types/${roomTypeId}`)
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.status).toBe(200);
        });
    });
});
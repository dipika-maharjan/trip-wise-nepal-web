import request from 'supertest';
import app from '../../app';
import { OptionalExtraModel } from '../../models/optionalExtra.model';
import { UserModel } from '../../models/user.model';

describe('Optional Extra Integration Tests', () => {
    let adminToken: string;
    let optionalExtraId: string;
    let accommodationId: string;

    const adminCredentials = {
        email: 'admin@example.com',
        password: 'Admin@1234'
    };

    const newOptionalExtra = {
        name: 'Breakfast',
        description: 'Morning meal',
        price: 20,
        priceType: 'per_person',
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
        // Create accommodation for optional extra
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
        await OptionalExtraModel.deleteMany({ name: newOptionalExtra.name });
    });

    afterAll(async () => {
        await OptionalExtraModel.deleteMany({ name: newOptionalExtra.name });
    });

    describe('POST /api/optional-extras', () => {
                test('should fail to create optional extra with missing name', async () => {
                    const res = await request(app)
                        .post('/api/optional-extras')
                        .set('Authorization', `Bearer ${adminToken}`)
                        .send({
                            accommodationId,
                            price: 20,
                            priceType: 'per_person',
                            isActive: true
                        });
                    expect(res.status).toBe(400);
                });
                test('should fail to create optional extra without authorization', async () => {
                    const res = await request(app)
                        .post('/api/optional-extras')
                        .send({ accommodationId, ...newOptionalExtra });
                    expect([401,403]).toContain(res.status);
                });
        test('should create a new optional extra', async () => {
            const res = await request(app)
                .post('/api/optional-extras')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    accommodationId,
                    ...newOptionalExtra
                });
            expect(res.status).toBe(201);
            expect(res.body.data).toBeDefined();
            expect(res.body.data.name).toBe(newOptionalExtra.name);
            optionalExtraId = res.body.data._id;
        });
    });

    describe('GET /api/optional-extras', () => {
        test('should get all optional extras', async () => {
            const res = await request(app)
                .get('/api/optional-extras');
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    describe('GET /api/optional-extras/:id', () => {
        test('should get optional extra by ID', async () => {
            const res = await request(app)
                .get(`/api/optional-extras/${optionalExtraId}`);
            expect(res.status).toBe(200);
            expect(res.body.data._id).toBe(optionalExtraId);
        });
    });

    describe('PUT /api/optional-extras/:id', () => {
        test('should update optional extra', async () => {
            const res = await request(app)
                .put(`/api/optional-extras/${optionalExtraId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    price: 25,
                    accommodationId,
                    name: 'Breakfast',
                    description: 'Morning meal',
                    priceType: 'per_person',
                    isActive: true
                });
            expect(res.status).toBe(200);
            expect(res.body.data.price).toBe(25);
        });
    });

    describe('DELETE /api/optional-extras/:id', () => {
        test('should delete optional extra', async () => {
            const res = await request(app)
                .delete(`/api/optional-extras/${optionalExtraId}`)
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.status).toBe(200);
        });
    });
});
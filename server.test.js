const request = require('supertest');
const app = require('./server');

describe('POST /api/contact', () => {
    let originalEnv;

    beforeAll(() => {
        originalEnv = process.env;
    });

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...originalEnv };
        process.env.GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/test/exec';

        // Mock global fetch
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                status: 200,
                statusText: 'OK',
            })
        );
    });

    afterAll(() => {
        process.env = originalEnv;
        jest.restoreAllMocks();
    });

    it('should return 400 if required fields are missing', async () => {
        const res = await request(app)
            .post('/api/contact')
            .send({ name: 'John Doe', email: 'john@example.com' }); // missing message

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('error', 'Name, email, and message are required.');
    });

    it('should return 400 if email is invalid', async () => {
        const res = await request(app)
            .post('/api/contact')
            .send({ name: 'John Doe', email: 'invalid-email', message: 'Hello' });

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('error', 'Invalid email address.');
    });

    it('should return 500 if GOOGLE_SCRIPT_URL is missing', async () => {
        delete process.env.GOOGLE_SCRIPT_URL;

        const res = await request(app)
            .post('/api/contact')
            .send({ name: 'John Doe', email: 'john@example.com', message: 'Hello' });

        expect(res.statusCode).toEqual(500);
        expect(res.body).toHaveProperty('error', 'Server configuration error.');
    });

    it('should return 200 on successful submission', async () => {
        const res = await request(app)
            .post('/api/contact')
            .send({ name: 'John Doe', email: 'john@example.com', message: 'Hello' });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('success', true);
        expect(res.body).toHaveProperty('message', 'Message sent successfully.');

        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(global.fetch).toHaveBeenCalledWith(
            'https://script.google.com/macros/s/test/exec',
            expect.objectContaining({
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })
        );
    });

    it('should return 500 if Google Script request fails', async () => {
        global.fetch.mockImplementationOnce(() =>
            Promise.resolve({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error',
            })
        );

        const res = await request(app)
            .post('/api/contact')
            .send({ name: 'John Doe', email: 'john@example.com', message: 'Hello' });

        expect(res.statusCode).toEqual(500);
        expect(res.body).toHaveProperty('error', 'Failed to send message.');
    });

    it('should return 500 if fetch throws an exception', async () => {
        global.fetch.mockImplementationOnce(() => Promise.reject(new Error('Network error')));

        const res = await request(app)
            .post('/api/contact')
            .send({ name: 'John Doe', email: 'john@example.com', message: 'Hello' });

        expect(res.statusCode).toEqual(500);
        expect(res.body).toHaveProperty('error', 'Failed to send message.');
    });
});

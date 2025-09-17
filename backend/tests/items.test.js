const request = require('supertest');
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const createItemsRouter = require("../src/routes/items");

const DATA_PATH = path.join(__dirname, './data/items.json');

const mockItems = [
    { id: 1, name: 'Item 1', price: 10.0, category: 'Category 1' },
    { id: 2, name: 'Item 2', price: 20.0, category: 'Category 2' },
    { id: 3, name: 'Item 3', price: 30.0, category: 'Category 3' }
];

// Helper to reset test data
async function resetItems() {
    await fs.writeFile(DATA_PATH, JSON.stringify([], null, 2));
}

// Helper to add mock data
async function addMockItems() {
    await fs.writeFile(DATA_PATH, JSON.stringify(mockItems, null, 2));
}

// Helper to delete the file
async function deleteDataFile() {
    await fs.unlink(DATA_PATH);
}

describe('Items API', () => {
    let app;

    beforeEach(async () => {
        await resetItems();
        app = express();
        app.use(express.json());
        app.use('/api/items', createItemsRouter(DATA_PATH));
    });

    it('GET /api/items should return empty array', async () => {
        const res = await request(app).get('/api/items');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual([]);
    });

    it('GET /api/items should return the items correctly', async () => {
        await addMockItems();
        const res = await request(app).get('/api/items');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveLength(3);
        expect(res.body[0]).toEqual(mockItems[0]);
        expect(res.body[1]).toEqual(mockItems[1]);
        expect(res.body[2]).toEqual(mockItems[2]);
    });

    it('GET /api/items should create the file if it does not exist', async () => {
        await deleteDataFile();
        const res = await request(app).get('/api/items');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual([]);
    });

    it('GET /api/items/:id should return the created item', async () => {
        await addMockItems();
        const id = 2;
        const res = await request(app).get(`/api/items/${id}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.name).toBe(mockItems[1].name);
    });

    it('GET /api/items/:id should return 404 if not found', async () => {
        await addMockItems();
        const res = await request(app).get('/api/items/99999');
        expect(res.statusCode).toBe(404);
        expect(res.error).toBeDefined();
    });

    it('GET /api/items with query should filter and limit results', async () => {
        await addMockItems();
        const res = await request(app)
            .get('/api/items')
            .query({ q: 'item', limit: 2 });

        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(2);
        expect(res.body[0].name.toLowerCase()).toContain('item');
        expect(res.body[1].name.toLowerCase()).toContain('item');
    });

    it('POST /api/items should create a new item', async () => {
        const item = { name: 'Item 4', category: 'Category X', price: 12.5 };
        const res = await request(app).post('/api/items').send(item);
        expect(res.statusCode).toBe(201);
        expect(res.body.name).toBe(item.name);
    });

    it('POST /api/items should fail if name is missing', async () => {
        const res = await request(app)
            .post('/api/items')
            .send({ category: 'Books', price: 10 });

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toMatch(/name/i);
    });

    it('POST /api/items should fail if name is empty string', async () => {
        const res = await request(app)
            .post('/api/items')
            .send({ name: '   ', category: 'Books', price: 10 });

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toMatch(/name/i);
    });

    it('POST /api/items should fail if category is missing', async () => {
        const res = await request(app)
            .post('/api/items')
            .send({ name: 'Book', price: 10 });

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toMatch(/category/i);
    });

    it('POST /api/items should fail if category is empty string', async () => {
        const res = await request(app)
            .post('/api/items')
            .send({ name: 'Book', category: '   ', price: 10 });

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toMatch(/category/i);
    });

    it('POST /api/items should fail if price is not a number', async () => {
        const res = await request(app)
            .post('/api/items')
            .send({ name: 'Book', category: 'Books', price: 'abc' });

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toMatch(/price/i);
    });
});

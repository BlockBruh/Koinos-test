const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();
const DATA_PATH = path.join(__dirname, '../../../data/items.json');

// Utility to read data
async function readData() {
    try {
        const data = await fs.readFile(DATA_PATH, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error reading data:', err);
        throw new Error('Failed to read data');
    }
}

// GET /api/items
router.get('/', async (req, res, next) => {
    try {
        const data = await readData();
        const {limit, q} = req.query;
        let results = data;

        if (q) {
            // Simple substring search (sub‑optimal)
            results = results.filter(item => item.name.toLowerCase().includes(q.toLowerCase()));
        }

        if (limit) {
            results = results.slice(0, parseInt(limit));
        }

        res.json(results);
    } catch (err) {
        next(err);
    }
});

// GET /api/items/:id
router.get('/:id', async (req, res, next) => {
    try {
        const data = await readData();
        const item = data.find(i => i.id === parseInt(req.params.id));
        if (!item) {
            const err = new Error('Item not found');
            err.status = 404;
            throw err;
        }
        res.json(item);
    } catch (err) {
        next(err);
    }
});

// POST /api/items
router.post('/', async (req, res, next) => {
    try {
        const {name, price, category} = req.body;
        // Basic validation
        if (typeof name !== 'string' || name.trim() === '') {
            return res.status(400).json({error: 'Name is required and must be a non-empty string'});
        }
        if (typeof category !== 'string' || category.trim() === '') {
            return res.status(400).json({error: 'Category is required and must be a non-empty string'});
        }
        if (price !== undefined && typeof price !== 'number') {
            return res.status(400).json({error: 'Price must be a number if provided'});
        }
        const data = await readData();
        const item = {
            id: Date.now(),
            name: name.trim(),
            category: category.trim(),
            price: price ?? null,
        };
        data.push(item);
        await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2));
        res.status(201).json(item);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
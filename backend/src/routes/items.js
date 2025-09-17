const express = require('express');
const fs = require('fs').promises;

function createItemsRouter(DATA_PATH) {
    const router = express.Router();

    // Utility to read data
    async function readData() {
        try {
            const raw = await fs.readFile(DATA_PATH, 'utf-8');
            return JSON.parse(raw);
        } catch (err) {
            if (err.code === 'ENOENT') {
                // If file doesn't exist, initialize empty
                await fs.writeFile(DATA_PATH, JSON.stringify([], null, 2));
                return [];
            }
            throw err;
        }
    }

    // Utility to write data
    async function writeData(data) {
        await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2));
    }

    // GET /api/items
    router.get('/', async (req, res, next) => {
        try {
            const data = await readData();
            const { limit, q } = req.query;
            let results = data;

            if (q) {
                results = results.filter(item =>
                    item.name.toLowerCase().includes(q.toLowerCase())
                );
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
                return res.status(404).json({ error: 'Item not found' });
            }
            res.json(item);
        } catch (err) {
            next(err);
        }
    });

    // POST /api/items
    router.post('/', async (req, res, next) => {
        try {
            const { name, price, category } = req.body;

            // Basic validation
            if (typeof name !== 'string' || name.trim() === '') {
                return res
                    .status(400)
                    .json({ error: 'Name is required and must be a non-empty string' });
            }
            if (typeof category !== 'string' || category.trim() === '') {
                return res
                    .status(400)
                    .json({ error: 'Category is required and must be a non-empty string' });
            }
            if (price !== undefined && typeof price !== 'number') {
                return res
                    .status(400)
                    .json({ error: 'Price must be a number if provided' });
            }

            const data = await readData();
            const item = {
                id: Date.now(),
                name,
                category,
                price: price ?? null,
            };
            data.push(item);
            await writeData(data);

            res.status(201).json(item);
        } catch (err) {
            next(err);
        }
    });

    return router;
}

module.exports = createItemsRouter;

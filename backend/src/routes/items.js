const express = require('express');
const fs = require('fs').promises;

function createItemsRouter(DATA_PATH) {
    const router = express.Router();

    async function readData() {
        try {
            const raw = await fs.readFile(DATA_PATH, 'utf-8');
            return JSON.parse(raw);
        } catch (err) {
            if (err.code === 'ENOENT') {
                await fs.writeFile(DATA_PATH, JSON.stringify([], null, 2));
                return [];
            }
            throw err;
        }
    }

    async function writeData(data) {
        await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2));
    }

    // GET /api/items with search & pagination
    router.get('/', async (req, res, next) => {
        try {
            const data = await readData();
            const { q = '', page = '', limit = '' } = req.query;

            const results = data.filter(item =>
                item.name.toLowerCase().includes(q.toLowerCase())
            );

            if(page !== '' && limit !== '') {
                const pageNumber = parseInt(page);
                const limitNumber = parseInt(limit);
                //get the start index
                const start = (pageNumber - 1) * limitNumber;
                const items = results.slice(start, start + limitNumber);

                res.json({
                    total: results.length,
                    page: pageNumber,
                    limit: limitNumber,
                    items,
                });
            } else {
                // If no pagination, return all results
                res.json({
                    total: results.length,
                    page: 1,
                    limit: results.length,
                    items: results,
                });
            }
        } catch (err) {
            next(err);
        }
    });

    // GET /api/items/:id
    router.get('/:id', async (req, res, next) => {
        try {
            const data = await readData();
            const item = data.find(i => i.id === parseInt(req.params.id));
            if (!item) return res.status(404).json({ error: 'Item not found' });
            res.json(item);
        } catch (err) {
            next(err);
        }
    });

    // POST /api/items with validation
    router.post('/', async (req, res, next) => {
        try {
            const { name, price, category } = req.body;

            if (typeof name !== 'string' || name.trim() === '')
                return res.status(400).json({ error: 'Name is required and must be a non-empty string' });

            if (typeof category !== 'string' || category.trim() === '')
                return res.status(400).json({ error: 'Category is required and must be a non-empty string' });

            if (price !== undefined && typeof price !== 'number')
                return res.status(400).json({ error: 'Price must be a number if provided' });

            const data = await readData();
            const item = { id: Date.now(), name, category, price: price ?? null };
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

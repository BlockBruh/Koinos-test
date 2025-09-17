const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();
const DATA_PATH = path.join(__dirname, '../../../data/items.json');

let cachedStats = null;
let cacheTimestamp = null;

// Compute stats from items
async function computeStats() {
    console.log('Computing stats...');
    const raw = await fs.readFile(DATA_PATH, 'utf-8');
    const items = JSON.parse(raw);

    return {
        total: items.length,
        averagePrice: items.length
            ? items.reduce((acc, cur) => acc + (cur.price || 0), 0) / items.length
            : 0
    };
}

// Watch the file for changes and invalidate cache
require('fs').watch(DATA_PATH, 'utf-8', () => {
    cachedStats = null;
    cacheTimestamp = null;
    console.log('items.json changed — stats cache invalidated');
});


// GET /api/stats
router.get('/', async (req, res, next) => {
    try {
        if (!cachedStats) {
            cachedStats = await computeStats();
            cacheTimestamp = new Date();
        }
        res.json({
            ...cachedStats,
            cachedAt: cacheTimestamp
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
const express = require('express');
const path = require('path');
const morgan = require('morgan');
const createItemsRouter = require('./routes/items');
const statsRouter = require('./routes/stats');
const cors = require('cors');
const { getCookie, notFound } = require('./middleware/errorHandler');

const DATA_PATH = path.join(__dirname, '../../data/items.json');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:3000' }));
// Basic middleware
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/items', createItemsRouter(DATA_PATH));
app.use('/api/stats', statsRouter);

// Not Found
app.use('*', notFound);

getCookie();

app.listen(port, () => console.log('Backend running on http://localhost:' + port));
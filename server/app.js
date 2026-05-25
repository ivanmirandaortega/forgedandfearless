const express = require('express');
const cors = require('cors');

const goalRoutes = require('./routes/goal-routes');

const app = express();

app.use(
	cors({
		origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
	}),
);

app.use(express.json());

app.get('/', (_req, res) => {
	res.json({
		name: 'ff-app-api',
		status: 'ok',
	});
});

app.use('/api/goals', goalRoutes);

app.use((error, _req, res, _next) => {
	console.error(error);

	res.status(error.statusCode || 500).json({
		message: error.message || 'Unexpected server error',
	});
});

module.exports = app;

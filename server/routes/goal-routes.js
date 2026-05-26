const express = require('express');

const Goal = require('../models/Goal');

const router = express.Router();

router.get('/', async (_req, res) => {
	const goals = await Goal.find().sort({ createdAt: -1 }).lean();
	res.json(goals);
});

module.exports = router;

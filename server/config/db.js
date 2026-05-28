const mongoose = require('mongoose');

let isConnected = false;

async function connectToDatabase() {
	if (isConnected) {
		return mongoose.connection;
	}

	const mongoUri = process.env.MONGODB_URI;

	if (!mongoUri) {
		throw new Error('MONGODB_URI is not configured');
	}

	await mongoose.connect(mongoUri);
	isConnected = true;

	return mongoose.connection;
}

function normalizeGoal(goal) {
	return {
		id: goal._id || goal.id,
		title: goal.title,
		frequency: goal.frequency,
		endDate: String(goal.endDate || '').slice(0, 10),
	};
}

export async function fetchGoals() {
	const goals = await request('/api/goals');
	return goals.map(normalizeGoal);
}

export async function fetchGoal(goalId) {
	const goal = await request(`/api/goals/${goalId}`);
	return normalizeGoal(goal);
}

export async function createGoal(goal) {
	const createdGoal = await request('/api/goals', {
		method: 'POST',
		body: JSON.stringify(goal),
	});

	return normalizeGoal(createdGoal);
}

export async function updategoal(goalId, goal) {
	const updatedGoal = await request(`/api/goals/${goalId}`, {
		method: 'PATCH',
		body: JSON.stringify(goal),
	});

	return normalizeGoal(updatedGoal);
}

export async function removeGoal(goalId) {
	await request(`/api/goals${goalId}`, {
		method: 'DELETE',
	});
}

module.exports = connectToDatabase;

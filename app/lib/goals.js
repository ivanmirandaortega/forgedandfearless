import next from 'next';

// temporary local storage key
export const GOALS_STORAGE_KEY = 'fitness-goals';

// default goal to showcase a prior saved goal
export const defaultGoals = [
	{
		id: 'chest-day',
		title: 'Chest Day',
		frequency: '3x per week',
		endDate: '2026-12-31',
	},
];

// formats the date for the goals
export function formatGoalDate(endDate) {
	if (!endDate) {
		return '';
	}

	const date = new Date(`${endDate}T00:00:00`);

	if (Number.isNaN(date.getTime())) {
		return endDate;
	}

	return new Intl.DateTimeFormat('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	}).format(date);
}

// reads goals from the storage
export function readGoals() {
	if (typeof window === 'undefined') {
		return defaultGoals;
	}

	const rawGoals = window.localStorage.getItem(GOALS_STORAGE_KEY);

	if (!rawGoals) {
		window.localStorage.setItem(
			GOALS_STORAGE_KEY,
			JSON.stringify(defaultGoals),
		);
		return defaultGoals;
	}

	try {
		const parsedGoals = JSON.parse(rawGoals);
		return Array.isArray(parsedGoals) ? parsedGoals : defaultGoals;
	} catch {
		window.localStorage.setItem(
			GOALS_STORAGE_KEY,
			JSON.stringify(defaultGoals),
		);
		return defaultGoals;
	}
}

//writes a goal to the local storage
export function writeGoals(goals) {
	if (typeof window === 'undefined') {
		return;
	}

	window.localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals));
}

// adds or updates a goal
export function upsertGoal(goal) {
	const goals = readGoals();
	const goalIndex = goals.findIndex((item) => item.id === goal.id);

	if (goalIndex === -1) {
		const nextGoals = [...goals, goal];
		writeGoals(nextGoals);
		return nextGoals;
	}

	const nextGoals = goals.map((item) => (item.id === goal.id ? goal : item));
	writeGoals(nextGoals);
	return nextGoals;
}

// deletes a goal
export function deleteGoal(goalId) {
	const nextGoals = readGoals().filter((goal) => goal.id !== goalId);
	writeGoals(nextGoals);
	return nextGoals;
}

// finds a goal by its id
export function getGoalById(goalId) {
	return readGoals().find((goal) => goal.id === goalId) ?? null;
}

// generatea a slug id for the goal created
export function buildGoalId(title) {
	const slug = title
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');

	return slug || `goal-${Date.now()}`;
}

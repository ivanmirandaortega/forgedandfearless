const GOALS_API_ROUTE = '/api/goals';
const DEFAULT_GOAL_USER_ID = process.env.NEXT_PUBLIC_GOALS_USER_ID || 'user_1';
const DEFAULT_GOAL_APP_ID =
	process.env.NEXT_PUBLIC_GOALS_APP_ID || 'fitness-checkin-app';

function deriveTargetDescription(title) {
	const trimmedTitle = title.trim();

	if (!trimmedTitle) {
		return '';
	}

	const matchedTarget = trimmedTitle.match(
		/^(.*?)(?:\s+by\s+.+|\s+before\s+.+|\s+within\s+.+)$/i,
	);

	return (matchedTarget?.[1] ?? trimmedTitle).trim();
}

function buildGoalMetadata(goal) {
	const metadata = {
		...(goal.metadata ?? {}),
	};

	if (!metadata.targetDescription) {
		metadata.targetDescription = deriveTargetDescription(goal.title ?? '');
	}

	return metadata;
}

function formatFrequencyValue(goal) {
	if (typeof goal.frequency === 'string' && goal.frequency.trim()) {
		return goal.frequency.trim();
	}

	if (goal.frequency && typeof goal.frequency === 'object') {
		if (
			goal.frequency.type === 'weekly_count' &&
			goal.frequency.requiredCount != null
		) {
			return `${goal.frequency.requiredCount}x per week`;
		}
	}

	if (goal.frequencyType === 'weekly_count' && goal.requiredCount != null) {
		return `${goal.requiredCount}x per week`;
	}

	if (typeof goal.targetFrequency === 'string' && goal.targetFrequency()) {
		return goal.targetFrequency.trim();
	}

	return '';
}

function parseFrequencyInput(value) {
	const trimmedValue = value.trim();
	const weeklyCountMatch = trimmedValue.match(
		/^(\d+)\s*x?\s*(per\s+week|weekly)?$/i,
	);

	if (weeklyCountMatch) {
		return {
			frequency: {
				type: 'weekly_count',
				requiredCount: Number(weeklyCountMatch[1]),
			},
		};
	}

	return {
		frequency: trimmedValue,
	};
}

function toGoalPayload(goal) {
	const frequencyFields = parseFrequencyInput(goal.frequency ?? '');

	return {
		id: goal.id,
		userId: goal.userId || DEFAULT_GOAL_USER_ID,
		appId: goal.appId || DEFAULT_GOAL_APP_ID,
		title: goal.title.trim(),
		goalType: goal.goalType || 'general',
		endDate: goal.endDate,
		status: goal.status || 'active',
		metadata: buildGoalMetadata(goal),
		...frequencyFields,
	};
}

function normalizeGoal(goal) {
	if (!goal || typeof goal != 'object') {
		return null;
	}

	const id = goal.id ?? goal._id;
	const title = goal.title ?? goal.name ?? '';
	const endDate = goal.endDate ?? goal.deadline ?? '';

	if (!id || !title) {
		return null;
	}

	return {
		id: String(id),
		userId: String(goal.userId ?? DEFAULT_GOAL_USER_ID),
		appId: String(goal.appId ?? DEFAULT_GOAL_APP_ID),
		title: String(title),
		frequency: formatFrequencyValue(goal),
		endDate: String(endDate),
		goalType: String(goal.goalType ?? 'general'),
		status: String(goal.status ?? 'active'),
		metadata: goal.metadata ?? {},
	};
}

async function parseJsonResponse(response) {
	const text = await response.text();

	if (!text) {
		return null;
	}

	try {
		return JSON.parse(text);
	} catch {
		return null;
	}
}

async function requestGoals(path = '', options = {}) {
	const response = await fetch(`${GOALS_API_ROUTE}${path}`, {
		cache: 'no-store',
		...options,
		headers: {
			'Content-Type': 'application/json',
			...(options.headers ?? {}),
		},
	});

	const data = await parseJsonResponse(response);

	if (!response.ok) {
		const message =
			data?.error ??
			data?.message ??
			`Goals request failed with status ${response.status}`;
		throw new Error(message);
	}

	return data;
}

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

export async function fetchGoals() {
	const data = await requestGoals();
	const goals = Array.isArray(data) ? data : data?.goals;

	if (!Array.isArray(goals)) {
		return [];
	}

	return goals.map(normalizeGoal).filter(Boolean);
}

export async function fetchGoalById(goalId) {
	const data = await requestGoals(`/${goalId}`);
	return normalizeGoal(data?.goal ?? data);
}

export async function createGoal(goal) {
	const data = await requestGoals('', {
		method: 'POST',
		body: JSON.stringify(toGoalPayload(goal)),
	});

	return normalizeGoal(data?.goal ?? data);
}

// deletes a goal
export async function updateGoal(goalId, goal) {
	const data = await requestGoals(`/${goalId}`, {
		method: 'PUT',
		body: JSON.stringify(toGoalPayload({ ...goal, id: goalId })),
	});

	return normalizeGoal(data?.goal ?? data);
}

export async function deleteGoal(goalId) {
	await requestGoals(`/${goalId}`, {
		method: 'DELETE',
	});
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

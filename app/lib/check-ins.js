const CHECK_INS_API_ROUTE = '/api/check-ins';

export const DEFAULT_CHECKIN_USER_ID =
	process.env.NEXT_PUBLIC_GOALS_USER_ID || 'user_1';
export const DEFAULT_CHECKIN_APP_ID =
	process.env.NEXT_PUBLIC_GOALS_APP_ID || 'fitness-checkin-app';

function formatDatePart(value) {
	return String(value).padStart(2, '0');
}

export function formatCheckInDate(date = new Date()) {
	return [
		date.getFullYear(),
		formatDatePart(date.getMonth() + 1),
		formatDatePart(date.getDate()),
	].join('-');
}

export function getDaysInMonth(date = new Date()) {
	return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

function normalizeCheckIn(checkIn) {
	if (!checkIn || typeof checkIn !== 'object') {
		return null;
	}

	if (!checkIn.userId || !checkIn.appId || !checkIn.date) {
		return null;
	}

	return {
		id: String(
			checkIn.id ?? `${checkIn.appId}:${checkIn.userId}:${checkIn.date}`,
		),
		userId: String(checkIn.userId),
		appId: String(checkIn.appId),
		date: String(checkIn.date),
		createdAt: checkIn.createdAt ? String(checkIn.createdAt) : null,
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

async function requestCheckIns(path = '', options = {}) {
	const response = await fetch(`${CHECK_INS_API_ROUTE}${path}`, {
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
			`Check-in request failed with status ${response.status}`;
		const error = new Error(message);
		error.status = response.status;
		throw error;
	}

	return data;
}

export async function fetchCheckIns({
	userId = DEFAULT_CHECKIN_USER_ID,
	appId = DEFAULT_CHECKIN_APP_ID,
} = {}) {
	const data = await requestCheckIns();
	const checkIns = Array.isArray(data) ? data : data?.checkIns;

	if (!Array.isArray(checkIns)) {
		return [];
	}

	return checkIns
		.map(normalizeCheckIn)
		.filter(Boolean)
		.filter((checkIn) => checkIn.userId === userId && checkIn.appId === appId)
		.sort((left, right) => left.date.localeCompare(right.date));
}

export async function createCheckIn({
	userId = DEFAULT_CHECKIN_USER_ID,
	appId = DEFAULT_CHECKIN_APP_ID,
	date = formatCheckInDate(),
} = {}) {
	const data = await requestCheckIns('', {
		method: 'POST',
		body: JSON.stringify({ userId, appId, date }),
	});

	return normalizeCheckIn(data?.checkIn ?? data);
}

function createDateFromKey(dateKey) {
	return new Date(`${dateKey}T00:00:00`);
}

export function getStreakSummary(checkIns) {
	const sortedDates = Array.from(
		new Set(
			(checkIns ?? [])
				.map((checkIn) => normalizeCheckIn(checkIn)?.date)
				.filter(Boolean),
		),
	).sort((left, right) => left.localeCompare(right));

	if (sortedDates.length === 0) {
		return {
			currentStreak: 0,
			longestStreak: 0,
			lastCheckInDate: null,
		};
	}

	let longestStreak = 1;
	let runningStreak = 1;

	for (let index = 1; index < sortedDates.length; index += 1) {
		const previous = createDateFromKey(sortedDates[index - 1]);
		const current = createDateFromKey(sortedDates[index]);
		const diffDays = Math.round((current - previous) / 86400000);

		if (diffDays === 1) {
			runningStreak += 1;
			longestStreak = Math.max(longestStreak, runningStreak);
			continue;
		}

		runningStreak = 1;
	}

	let currentStreak = 1;

	for (let index = sortedDates.length - 1; index > 0; index -= 1) {
		const previous = createDateFromKey(sortedDates[index - 1]);
		const current = createDateFromKey(sortedDates[index]);
		const diffDays = Math.round((current - previous) / 86400000);

		if (diffDays === 1) {
			currentStreak += 1;
			continue;
		}

		break;
	}

	return {
		currentStreak,
		longestStreak,
		lastCheckInDate: sortedDates[sortedDates.length - 1],
	};
}

export function buildStreakDays(checkIns, date = new Date()) {
	const completedDates = new Set(
		(checkIns ?? [])
			.map((checkIn) => normalizeCheckIn(checkIn)?.date)
			.filter(Boolean),
	);
	const days = [];
	const today = new Date(date);
	today.setHours(0, 0, 0, 0);
	const daysInMonth = getDaysInMonth(today);

	for (let day = 1; day <= daysInMonth; day += 1) {
		const currentDate = new Date(today.getFullYear(), today.getMonth(), day);

		const dateKey = formatCheckInDate(currentDate);
		let status = 'upcoming';

		if (completedDates.has(dateKey)) {
			status = 'complete';
		} else if (day < today.getDate()) {
			status = 'missed';
		} else if (day === today.getDate()) {
			status = 'current';
		}

		days.push({
			date: dateKey,
			day,
			status,
		});
	}

	return days;
}

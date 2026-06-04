const CHECK_INS_API_ROUTE = '/api/check-ins';
const DEFAULT_CHECK_IN_USER_ID =
	process.env.NEXT_PUBLIC_GOALS_USER_ID || 'user_1';
const DEFAULT_CHECK_IN_APP_ID =
	process.env.NEXT_PUBLIC_GOALS_APP_ID || 'fitness-checkin-app';

export const CHECK_INS_UPDATED_EVENT = 'check-ins:updated';

function normalizeCheckIn(checkIn) {
	if (!checkIn || typeof checkIn !== 'object') {
		return null;
	}

	if (!checkIn.userId || !checkIn.appId || !checkIn.date) {
		return null;
	}

	return {
		id: String(checkIn.id ?? `${checkIn.appId}:${checkIn.userId}:${checkIn.date}`),
		userId: String(checkIn.userId),
		appId: String(checkIn.appId),
		date: String(checkIn.date),
		createdAt: checkIn.createdAt ? String(checkIn.createdAt) : '',
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

async function requestCheckIns(options = {}) {
	const response = await fetch(CHECK_INS_API_ROUTE, {
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
		throw new Error(message);
	}

	return data;
}

function buildTodayDate() {
	const today = new Date();
	const year = today.getFullYear();
	const month = String(today.getMonth() + 1).padStart(2, '0');
	const day = String(today.getDate()).padStart(2, '0');

	return `${year}-${month}-${day}`;
}

export function formatCheckInDate(dateString) {
	if (!dateString) {
		return '';
	}

	const date = new Date(`${dateString}T00:00:00`);

	if (Number.isNaN(date.getTime())) {
		return dateString;
	}

	return new Intl.DateTimeFormat('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	}).format(date);
}

export async function fetchCheckIns(
	appId = DEFAULT_CHECK_IN_APP_ID,
	userId = DEFAULT_CHECK_IN_USER_ID,
) {
	const data = await requestCheckIns();
	const checkIns = Array.isArray(data) ? data : data?.checkIns;

	if (!Array.isArray(checkIns)) {
		return [];
	}

	return checkIns
		.map(normalizeCheckIn)
		.filter(Boolean)
		.filter((checkIn) => checkIn.appId === appId && checkIn.userId === userId)
		.sort((left, right) => right.date.localeCompare(left.date));
}

export async function createTodayCheckIn(
	appId = DEFAULT_CHECK_IN_APP_ID,
	userId = DEFAULT_CHECK_IN_USER_ID,
) {
	try {
		const data = await requestCheckIns({
			method: 'POST',
			body: JSON.stringify({
				userId,
				appId,
				date: buildTodayDate(),
			}),
		});

		return {
			checkIn: normalizeCheckIn(data?.checkIn ?? data),
			alreadyCheckedIn: false,
		};
	} catch (error) {
		if (error.message === 'check-in already exists') {
			return {
				checkIn: null,
				alreadyCheckedIn: true,
			};
		}

		throw error;
	}
}

export function emitCheckInsUpdated() {
	if (typeof window === 'undefined') {
		return;
	}

	window.dispatchEvent(new CustomEvent(CHECK_INS_UPDATED_EVENT));
}

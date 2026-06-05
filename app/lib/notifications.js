const NOTIFICATIONS_API_ROUTE = '/api/notifications';
const DISMISSED_NOTIFICATIONS_KEY = 'dismissed-goal-notifications';

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

async function requestNotifications(options = {}) {
	const response = await fetch(NOTIFICATIONS_API_ROUTE, {
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
			`Notifications request failed with status ${response.status}`;
		throw new Error(message);
	}

	return data;
}

export function readDismissedNotificationIds() {
	if (typeof window === 'undefined') {
		return new Set();
	}

	try {
		const stored = window.sessionStorage.getItem(DISMISSED_NOTIFICATIONS_KEY);
		const parsed = stored ? JSON.parse(stored) : [];
		return new Set(Array.isArray(parsed) ? parsed : []);
	} catch {
		return new Set();
	}
}

export function writeDismissedNotificationIds(ids) {
	if (typeof window === 'undefined') {
		return;
	}

	window.sessionStorage.setItem(
		DISMISSED_NOTIFICATIONS_KEY,
		JSON.stringify(Array.from(ids)),
	);
}

export function normalizeNotification(notification) {
	if (!notification || typeof notification !== 'object') {
		return null;
	}

	if (!notification.id || !notification.message || !notification.type) {
		return null;
	}

	return {
		id: String(notification.id),
		message: String(notification.message),
		type: String(notification.type),
		timestamp: notification.timestamp ?? new Date().toISOString(),
	};
}

export async function fetchNotifications() {
	const data = await requestNotifications();
	return Array.isArray(data) ? data : [];
}

export async function createNotification(notification) {
	return requestNotifications({
		method: 'POST',
		body: JSON.stringify(notification),
	});
}

export async function clearNotifications() {
	return requestNotifications({
		method: 'DELETE',
	});
}

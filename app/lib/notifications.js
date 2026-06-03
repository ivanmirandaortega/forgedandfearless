const NOTIFICATIONS_API_ROUTE = '/api/notifications';

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

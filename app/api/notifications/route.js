import { NextResponse } from 'next/server';

const notificationsApiUrl = process.env.NEXT_PUBLIC_NOTIFICATIONS_API_URL;

function buildNotificationsUrl() {
	if (!notificationsApiUrl) {
		throw new Error('Public notifications API url is not configured');
	}

	return `${notificationsApiUrl.replace(/\/$/, '')}/api/notifications`;
}

async function forwardRequest(url, init = {}) {
	const response = await fetch(url, {
		cache: 'no-store',
		...init,
		headers: {
			'Content-Type': 'application/json',
			...(init.headers ?? {}),
		},
	});

	const text = await response.text();
	const contentType =
		response.headers.get('content-type') ?? 'application/json';

	return new NextResponse(text, {
		status: response.status,
		headers: {
			'content-type': contentType,
		},
	});
}

export async function GET() {
	try {
		return await forwardRequest(buildNotificationsUrl());
	} catch (error) {
		return NextResponse.json(
			{ error: error.message || 'Unable to reach notification service' },
			{ status: 500 },
		);
	}
}

export async function POST(request) {
	try {
		const body = await request.text();

		return await forwardRequest(buildNotificationsUrl(), {
			method: 'POST',
			body,
		});
	} catch (error) {
		return NextResponse.json(
			{ error: error.message || 'Unable to create notification' },
			{ status: 500 },
		);
	}
}

export async function DELETE() {
	try {
		return await forwardRequest(buildNotificationsUrl(), {
			method: 'DELETE',
		});
	} catch (error) {
		return NextResponse.json(
			{ error: error.message || 'Unable to clear notifications' },
			{ status: 500 },
		);
	}
}

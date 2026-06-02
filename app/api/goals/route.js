import { NextResponse } from 'next/server';

const goalsApiUrl = process.env.NEXT_PUBLIC_GOALS_API_URL;

function buildGoalsUrl(path = '') {
	if (!goalsApiUrl) {
		throw new Error('Public goals API url is not configured');
	}

	return `${goalsApiUrl.replace(/\/$/, '')}/api/goals/${path}`;
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
		return await forwardRequest(buildGoalsUrl());
	} catch (error) {
		return NextResponse.json(
			{
				error: error.message || 'Unable to reach goals service',
			},
			{ status: 500 },
		);
	}
}

export async function POST(request) {
	try {
		const body = await request.text();

		return await forwardRequest(buildGoalsUrl(), {
			method: 'POST',
			body,
		});
	} catch (error) {
		return NextResponse.json(
			{
				error: error.message || 'Unable to create goals',
			},
			{ status: 500 },
		);
	}
}

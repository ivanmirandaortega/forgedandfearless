import { NextResponse } from 'next/server';

const checkInsApiUrl =
	process.env.NEXT_PUBLIC_CHECK_INS_API_URL || 'http://localhost:4003';

function buildCheckInsUrl() {
	return `${checkInsApiUrl.replace(/\/$/, '')}/api/check-ins`;
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
		return await forwardRequest(buildCheckInsUrl());
	} catch (error) {
		return NextResponse.json(
			{
				error: error.message || 'Unable to reach check-in service',
			},
			{ status: 500 },
		);
	}
}

export async function POST(request) {
	try {
		const body = await request.text();

		return await forwardRequest(buildCheckInsUrl(), {
			method: 'POST',
			body,
		});
	} catch (error) {
		return NextResponse.json(
			{
				error: error.message || 'Unable to create check-in',
			},
			{ status: 500 },
		);
	}
}

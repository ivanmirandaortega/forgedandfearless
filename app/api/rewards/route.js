import { NextResponse } from 'next/server';

const rewardsApiUrl =
	process.env.REWARDS_API_URL || process.env.NEXT_PUBLIC_REWARDS_API_URL;

function buildRewardsUrl() {
	if (!rewardsApiUrl) {
		throw new Error('REWARDS_API_URL is not configured');
	}

	return `${rewardsApiUrl.replace(/\/$/, '')}/api/rewards`;
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

export async function GET(request) {
	try {
		const { searchParams } = new URL(request.url);
		const url = new URL(buildRewardsUrl());

		searchParams.forEach((value, key) => {
			url.searchParams.set(key, value);
		});

		return await forwardRequest(url.toString());
	} catch (error) {
		return NextResponse.json(
			{ error: error.message || 'Unable to reach rewards service' },
			{ status: 500 },
		);
	}
}

export async function POST(request) {
	try {
		const body = await request.text();

		return await forwardRequest(buildRewardsUrl(), {
			method: 'POST',
			body,
		});
	} catch (error) {
		return NextResponse.json(
			{ error: error.message || 'Unable to grant rewards' },
			{ status: 500 },
		);
	}
}

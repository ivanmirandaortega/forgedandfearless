import { NextResponse } from 'next/server';

const goalsApiUrl = process.env.NEXT_PUBLIC_GOALS_API_URL;

function buildGoalUrl(goalId) {
	if (!goalsApiUrl) {
		throw new Error('Public goals API url is not configured');
	}

	const baseUrl = goalsApiUrl.replace(/\/$/, '');
	return `${baseUrl}/api/goals/${encodeURIComponent(goalId)}`;
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

export async function GET(_request, { params }) {
	try {
		const { goalId } = await params;
		return await forwardRequest(buildGoalUrl(goalId));
	} catch (error) {
		return NextResponse.json(
			{
				error: error.message || 'Unable to fetch goal',
			},
			{ status: 500 },
		);
	}
}

export async function PUT(request, { params }) {
	try {
		const { goalId } = await params;
		const body = await request.text();

		return await forwardRequest(buildGoalUrl(goalId), {
			method: 'PUT',
			body,
		});
	} catch (error) {
		return NextResponse.json(
			{
				error: error.message || 'Unable to update goal',
			},
			{ status: 500 },
		);
	}
}

export async function DELETE(_request, { params }) {
	try {
		const { goalId } = await params;

		return await forwardRequest(buildGoalUrl(goalId), {
			method: 'DELETE',
		});
	} catch (error) {
		return NextResponse.json(
			{
				error: error.message || 'Unable to delete goal',
			},
			{ status: 500 },
		);
	}
}

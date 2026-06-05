const REWARDS_API_ROUTE = '/api/rewards';
const DEFAULT_REWARDS_USER_ID =
	process.env.NEXT_PUBLIC_GOALS_USER_ID || 'user_1';
const DEFAULT_REWARDS_APP_ID =
	process.env.NEXT_PUBLIC_GOALS_APP_ID || 'fitness-checkin-app';

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

async function requestRewards(path = '', options = {}) {
	const response = await fetch(`${REWARDS_API_ROUTE}${path}`, {
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
			`Rewards request failed with status ${response.status}`;
		const error = new Error(message);
		error.status = response.status;
		throw error;
	}

	return data;
}

function normalizeRewardBalance(balance, userId, appId) {
	if (!balance || typeof balance !== 'object') {
		return {
			id: `${appId}:${userId}`,
			userId,
			appId,
			points: 0,
			updatedAt: null,
		};
	}

	return {
		id: String(balance.id ?? `${appId}:${userId}`),
		userId: String(balance.userId ?? userId),
		appId: String(balance.appId ?? appId),
		points: Number(balance.points ?? 0),
		updatedAt: balance.updatedAt ? String(balance.updatedAt) : null,
	};
}

export async function fetchRewardBalance({
	userId = DEFAULT_REWARDS_USER_ID,
	appId = DEFAULT_REWARDS_APP_ID,
} = {}) {
	const query = new URLSearchParams({ userId, appId });
	const data = await requestRewards(`?${query.toString()}`);

	return normalizeRewardBalance(data?.balance ?? data, userId, appId);
}

export async function awardCheckInReward({
	userId = DEFAULT_REWARDS_USER_ID,
	appId = DEFAULT_REWARDS_APP_ID,
	checkInId,
	points = 10,
	reason = 'daily_check_in',
} = {}) {
	const data = await requestRewards('', {
		method: 'POST',
		body: JSON.stringify({
			userId,
			appId,
			checkInId,
			points,
			reason,
		}),
	});

	return {
		balance: normalizeRewardBalance(data?.balance ?? data, userId, appId),
		duplicate: Boolean(data?.duplicate),
		rewardEvent: data?.rewardEvent ?? null,
	};
}

'use client';

import {
	BottomNav,
	CheckInHeader,
	MobileScreen,
	StreakRow,
} from '@/app/components/ui';
import { useCheckInState } from '@/app/components/use-check-in-state';

function formatPoints(points) {
	return new Intl.NumberFormat('en-US').format(points ?? 0);
}

export function RewardsPageClient() {
	const {
		checkInDisabled,
		handleCheckIn,
		isLoading,
		monthProgress,
		rewardBalance,
		streakDays,
	} = useCheckInState();

	return (
		<MobileScreen>
			<CheckInHeader
				currentDay={monthProgress.currentDay}
				totalDays={monthProgress.totalDays}
				isLoading={isLoading}
			/>
			<StreakRow days={streakDays} />

			<section className="rewards-card" aria-labelledby="rewards-title">
				<p className="eyebrow">Rewards</p>
				<h2 id="rewards-title">Total Points</h2>
				<p className="rewards-points">
					{isLoading ? '--' : formatPoints(rewardBalance?.points ?? 0)}
				</p>
				<p className="rewards-copy">
					{rewardBalance?.points
						? 'Points earned from successful daily check-ins.'
						: 'No rewards yet. Complete a daily check-in to earn your first 10 points.'}
				</p>
			</section>

			<BottomNav
				active="rewards"
				onCheckIn={handleCheckIn}
				checkInDisabled={checkInDisabled}
			/>
		</MobileScreen>
	);
}

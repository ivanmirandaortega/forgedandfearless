'use client';

import Link from 'next/link';
import {
	BottomNav,
	CheckInHeader,
	MobileScreen,
	NotificationToast,
	StreakRow,
} from '@/app/components/ui';
import { useCheckInState } from '@/app/components/use-check-in-state';

export function CheckInsPageClient() {
	const {
		checkInDisabled,
		checkInErrorMessage,
		checkInNotifications,
		dismissCheckInNotification,
		handleCheckIn,
		isLoading,
		isSubmitting,
		monthProgress,
		streakDays,
	} = useCheckInState();

	return (
		<MobileScreen>
			{checkInNotifications.length ? (
				<div
					className="goal-notification-stack"
					aria-label="Check-in notifications"
				>
					{checkInNotifications.map((notification) => (
						<NotificationToast
							key={notification.id}
							notification={notification}
							onDismiss={dismissCheckInNotification}
						/>
					))}
				</div>
			) : null}

			<CheckInHeader
				currentDay={monthProgress.currentDay}
				totalDays={monthProgress.totalDays}
				isLoading={isLoading}
			/>
			<StreakRow days={streakDays} />

			<section className="challenge-card">
				<div className="challenge-content">
					<h2>
						TRAIN.
						<br />
						GET REWARDS.
					</h2>
					<p>Set training challenges and gain rewards.</p>
					<Link className="challenge-cta" href="/goals">
						Start Challenge
					</Link>
				</div>
			</section>

			{checkInErrorMessage ? (
				<p className="goal-form-error">{checkInErrorMessage}</p>
			) : null}

			<button
				className="checkin-button"
				type="button"
				onClick={handleCheckIn}
				disabled={checkInDisabled}
			>
				{isSubmitting ? 'Saving...' : 'Check-In'}
			</button>

			<BottomNav
				active="home"
				onCheckIn={handleCheckIn}
				checkInDisabled={checkInDisabled}
			/>
		</MobileScreen>
	);
}

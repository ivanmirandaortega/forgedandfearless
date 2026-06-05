'use client';

import { useEffect, useMemo, useState } from 'react';
import {
	buildStreakDays,
	createCheckIn,
	fetchCheckIns,
	formatCheckInDate,
	getDaysInMonth,
} from '@/app/lib/check-ins';
import {
	createNotification,
	normalizeNotification,
	readDismissedNotificationIds,
	writeDismissedNotificationIds,
} from '@/app/lib/notifications';
import { awardCheckInReward, fetchRewardBalance } from '@/app/lib/rewards';

const CHECKIN_NOTIFICATION_TTL_MS = 5000;

function normalizeCheckInNotification(
	notification,
	fallbackMessage,
	fallbackType,
) {
	if (
		notification &&
		typeof notification === 'object' &&
		notification.id &&
		notification.message &&
		notification.type
	) {
		return {
			id: String(notification.id),
			message: String(notification.message),
			type: String(notification.type),
			timestamp: notification.timestamp ?? new Date().toISOString(),
		};
	}

	return {
		id: `checkin-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
		message: fallbackMessage,
		type: fallbackType,
		timestamp: new Date().toISOString(),
	};
}

export function useCheckInState() {
	const [checkIns, setCheckIns] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [checkInErrorMessage, setCheckInErrorMessage] = useState('');
	const [checkInNotifications, setCheckInNotifications] = useState([]);
	const [rewardBalance, setRewardBalance] = useState(null);

	useEffect(() => {
		if (!checkInNotifications.length) {
			return undefined;
		}

		const timeoutId = window.setTimeout(() => {
			const [notification] = checkInNotifications;

			if (notification) {
				setCheckInNotifications((current) =>
					current.filter((item) => item.id !== notification.id),
				);
			}
		}, CHECKIN_NOTIFICATION_TTL_MS);

		return () => {
			window.clearTimeout(timeoutId);
		};
	}, [checkInNotifications]);

	async function publishCheckInNotification(message, type) {
		try {
			const notification = await createNotification({ message, type });
			const normalizedNotification =
				normalizeNotification(notification) ??
				normalizeCheckInNotification(notification, message, type);
			setCheckInNotifications((current) => [
				normalizedNotification,
				...current,
			]);
		} catch {
			const fallbackNotification = normalizeCheckInNotification(
				null,
				message,
				type,
			);
			setCheckInNotifications((current) => [fallbackNotification, ...current]);
		}
	}

	useEffect(() => {
		let cancelled = false;

		async function loadCheckIns() {
			try {
				const [nextCheckIns, nextRewardBalance] = await Promise.all([
					fetchCheckIns(),
					fetchRewardBalance(),
				]);

				if (!cancelled) {
					setCheckIns(nextCheckIns);
					setRewardBalance(nextRewardBalance);
					setCheckInErrorMessage('');
				}
			} catch (error) {
				if (!cancelled) {
					setCheckInErrorMessage(
						error instanceof Error
							? error.message
							: 'Unable to load check-in history',
					);
				}
			} finally {
				if (!cancelled) {
					setIsLoading(false);
				}
			}
		}

		loadCheckIns();

		return () => {
			cancelled = true;
		};
	}, []);

	const todaysCheckInDate = formatCheckInDate();
	const todaysDate = useMemo(() => new Date(), []);
	const streakDays = useMemo(
		() => buildStreakDays(checkIns, todaysDate),
		[checkIns, todaysDate],
	);
	const monthProgress = useMemo(
		() => ({
			currentDay: todaysDate.getDate(),
			totalDays: getDaysInMonth(todaysDate),
		}),
		[todaysDate],
	);
	async function handleCheckIn() {
		if (isSubmitting) {
			return;
		}

		setIsSubmitting(true);
		setCheckInErrorMessage('');

		try {
			const checkIn = await createCheckIn({ date: todaysCheckInDate });

			setCheckIns((currentCheckIns) =>
				[...currentCheckIns, checkIn].sort((left, right) =>
					left.date.localeCompare(right.date),
				),
			);
			try {
				const rewardResult = await awardCheckInReward({
					checkInId: checkIn.id,
				});

				setRewardBalance(rewardResult.balance);
				await publishCheckInNotification(
					'Checked in for today. You earned 10 points.',
					'success',
				);
			} catch (rewardError) {
				setCheckInErrorMessage(
					rewardError instanceof Error
						? rewardError.message
						: 'Check-in saved, but rewards could not be updated',
				);
				await publishCheckInNotification(
					'Check-in saved, but rewards could not be updated.',
					'warning',
				);
			}
		} catch (error) {
			if (error instanceof Error && error.status === 409) {
				try {
					const [nextCheckIns, nextRewardBalance] = await Promise.all([
						fetchCheckIns(),
						fetchRewardBalance(),
					]);
					setCheckIns(nextCheckIns);
					setRewardBalance(nextRewardBalance);
				} catch {
					// Preserve the duplicate-success state even if the refresh fails.
				}

				await publishCheckInNotification(
					'You already checked in for today.',
					'error',
				);
				return;
			}

			setCheckInErrorMessage(
				error instanceof Error ? error.message : 'Unable to save check-in',
			);
			await publishCheckInNotification(
				error instanceof Error ? error.message : 'Unable to save check-in',
				'error',
			);
		} finally {
			setIsSubmitting(false);
		}
	}

	function dismissCheckInNotification(notificationId) {
		const dismissedIds = readDismissedNotificationIds();
		dismissedIds.add(notificationId);
		writeDismissedNotificationIds(dismissedIds);

		setCheckInNotifications((current) =>
			current.filter((notification) => notification.id !== notificationId),
		);
	}

	return {
		checkInErrorMessage,
		checkInDisabled: isSubmitting,
		checkInNotifications,
		dismissCheckInNotification,
		handleCheckIn,
		isLoading,
		isSubmitting,
		monthProgress,
		rewardBalance,
		streakDays,
	};
}

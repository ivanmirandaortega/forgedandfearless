'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
	AddGoalCard,
	BottomNav,
	CheckInHeader,
	DeleteGoalModal,
	GoalCard,
	MobileScreen,
	NotificationToast,
	StreakRow,
} from '@/app/components/ui';
import {
	buildGoalId,
	createGoal,
	deleteGoal,
	getGoalById,
	fetchGoals,
	upsertGoal,
	fetchGoalById,
	updateGoal,
} from '@/app/lib/goals';
import {
	createNotification,
	fetchNotifications,
	normalizeNotification,
	readDismissedNotificationIds,
	writeDismissedNotificationIds,
} from '@/app/lib/notifications';

import { useCheckInState } from './use-check-in-state';

const NOTIFICATION_TTL_MS = 5000;
const NOTIFICATION_RECENT_WINDOW_MS = 30000;

function isRecentNotification(notification) {
	const timestamp = new Date(notification.timestamp ?? '').getTime();

	if (Number.isNaN(timestamp)) {
		return true;
	}

	return Date.now() - timestamp <= NOTIFICATION_RECENT_WINDOW_MS;
}

async function publishGoalNotification(message, type = 'success') {
	try {
		return normalizeNotification(await createNotification({ message, type }));
	} catch (error) {
		console.error('Unable to publish notification', error);
		return null;
	}
}

function GoalForm({
	formState,
	onChange,
	onSubmit,
	submitLabel,
	title,
	description,
	missingGoal,
	errorMessage,
}) {
	return (
		<MobileScreen>
			<div className="goal-form-header">
				<Link className="back-link" href="/goals">
					Back
				</Link>
				<div>
					<h1>{title}</h1>
					<p>{description}</p>
				</div>
			</div>

			{missingGoal ? (
				<section className="goal-form-empty">
					<h2>Goal Not Found</h2>
					<p>The goal you tried to edit no longer exists.</p>
					<Link className="goal-form-submit" href="/goals">
						Return To Goals
					</Link>
				</section>
			) : (
				<form className="goal-form" onSubmit={onSubmit}>
					{errorMessage ? (
						<p className="goal-form-error">{errorMessage}</p>
					) : null}
					<label className="goal-field">
						<span>Goal Title</span>
						<input
							name="title"
							type="text"
							value={formState.title}
							onChange={onChange}
							placeholder="Chest Day"
							required
						/>
					</label>

					<label className="goal-field">
						<span>Target Frequency</span>
						<input
							name="frequency"
							type="text"
							value={formState.frequency}
							onChange={onChange}
							placeholder="3x per week"
							required
						/>
					</label>

					<label className="goal-field">
						<span>End Date</span>
						<input
							name="endDate"
							type="date"
							value={formState.endDate}
							onChange={onChange}
							required
						/>
					</label>

					<div className="goal-form-actions">
						<Link className="goal-form-cancel" href="/goals">
							Cancel
						</Link>
						<button className="goal-form-submit" type="submit">
							{submitLabel}
						</button>
					</div>
				</form>
			)}
		</MobileScreen>
	);
}

export function GoalsPageClient() {
	const router = useRouter();
	const [goals, setGoals] = useState([]);
	const [deleteCandidate, setDeleteCandidate] = useState(null);
	const [errorMessage, setErrorMessage] = useState('');
	const [notifications, setNotifications] = useState([]);
	const {
		checkInDisabled,
		checkInErrorMessage,
		checkInNotifications,
		dismissCheckInNotification,
		handleCheckIn,
		isLoading,
		monthProgress,
		streakDays,
	} = useCheckInState();
	const visibleNotifications = [...checkInNotifications, ...notifications];

	useEffect(() => {
		let cancelled = false;

		async function loadGoalsAndNotifications() {
			try {
				const [goalsResult, notificationsResult] = await Promise.allSettled([
					fetchGoals(),
					fetchNotifications(),
				]);

				if (goalsResult.status !== 'fulfilled') {
					throw goalsResult.reason;
				}

				if (!cancelled) {
					const dismissedIds = readDismissedNotificationIds();
					const nextNotifications =
						notificationsResult.status === 'fulfilled'
							? notificationsResult.value
							: [];
					const visibleNotifications = nextNotifications
						.map(normalizeNotification)
						.filter(Boolean)
						.filter(isRecentNotification)
						.filter((notification) => !dismissedIds.has(notification.id));

					setGoals(goalsResult.value);
					setNotifications(visibleNotifications);
					setErrorMessage('');
				}
			} catch (error) {
				if (!cancelled) {
					setErrorMessage(error.message);
				}
			}
		}

		loadGoalsAndNotifications();

		return () => {
			cancelled = true;
		};
	}, []);

	useEffect(() => {
		if (!notifications.length) {
			return undefined;
		}

		const timeoutId = window.setTimeout(() => {
			const [notification] = notifications;

			if (notification) {
				const dismissedIds = readDismissedNotificationIds();
				dismissedIds.add(notification.id);
				writeDismissedNotificationIds(dismissedIds);
				setNotifications((current) =>
					current.filter((item) => item.id !== notification.id),
				);
			}
		}, NOTIFICATION_TTL_MS);

		return () => {
			window.clearTimeout(timeoutId);
		};
	}, [notifications]);

	const dismissNotification = (notificationId) => {
		const dismissedIds = readDismissedNotificationIds();
		dismissedIds.add(notificationId);
		writeDismissedNotificationIds(dismissedIds);
		setNotifications((current) =>
			current.filter((notifcation) => notifcation.id !== notificationId),
		);
	};

	const handleDelete = async () => {
		if (!deleteCandidate) {
			return;
		}

		try {
			await deleteGoal(deleteCandidate.id);
			const notification = await publishGoalNotification(
				`Deleted goal "${deleteCandidate.title}"`,
			);
			if (notification) {
				setNotifications((current) => [notification, ...current]);
			}
			setGoals((current) =>
				current.filter((goal) => goal.id !== deleteCandidate.id),
			);
			setDeleteCandidate(null);
			setErrorMessage('');
		} catch (error) {
			setErrorMessage(error.message);
			setDeleteCandidate(null);
		}
	};

	return (
		<MobileScreen>
			{visibleNotifications.length ? (
				<div className="goal-notification-stack" aria-label="Notifications">
					{visibleNotifications.map((notifcation) => (
						<NotificationToast
							key={notifcation.id}
							notification={notifcation}
							onDismiss={(notificationId) => {
								if (
									checkInNotifications.some(
										(item) => item.id === notificationId,
									)
								) {
									dismissCheckInNotification(notificationId);
									return;
								}

								dismissNotification(notificationId);
							}}
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

			<section className="goals-content">
				{errorMessage || checkInErrorMessage ? (
					<p className="goal-form-error">
						{errorMessage || checkInErrorMessage}
					</p>
				) : null}
				{goals.map((goal) => (
					<GoalCard
						key={goal.id}
						goal={goal}
						onEdit={() => router.push(`/goals/${goal.id}/edit`)}
						onDelete={() => setDeleteCandidate(goal)}
					/>
				))}
				<AddGoalCard />
			</section>

			<BottomNav
				active="goals"
				onCheckIn={handleCheckIn}
				checkInDisabled={checkInDisabled}
			/>

			{deleteCandidate ? (
				<DeleteGoalModal
					onDelete={handleDelete}
					onCancel={() => setDeleteCandidate(null)}
				/>
			) : null}
		</MobileScreen>
	);
}

export function GoalCreatePageClient() {
	const router = useRouter();
	const [formState, setFormState] = useState({
		title: '',
		frequency: '',
		endDate: '',
	});
	const [errorMessage, setErrorMessage] = useState('');

	const handleChange = (event) => {
		const { name, value } = event.target;
		setFormState((current) => ({ ...current, [name]: value }));
	};

	const handleSubmit = async (event) => {
		event.preventDefault();

		const newGoal = {
			id: `${buildGoalId(formState.title)}-${Date.now()}`,
			title: formState.title.trim(),
			frequency: formState.frequency.trim(),
			endDate: formState.endDate,
		};

		try {
			await createGoal(newGoal);
			await publishGoalNotification(`Created goal "${newGoal.title}"`);
			router.push('/goals');
		} catch (error) {
			setErrorMessage(error.message);
		}
	};

	return (
		<GoalForm
			formState={formState}
			onChange={handleChange}
			onSubmit={handleSubmit}
			submitLabel="Save Goal"
			title="Set A Goal"
			description="Create a new goal with a title, frequency, and end date."
			errorMessage={errorMessage}
		/>
	);
}

export function GoalEditPageClient({ goalId }) {
	const router = useRouter();
	const [formState, setFormState] = useState({
		title: '',
		frequency: '',
		endDate: '',
	});
	const [missingGoal, setMissingGoal] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');

	useEffect(() => {
		let cancelled = false;

		async function loadGoal() {
			try {
				const goal = await fetchGoalById(goalId);

				if (!goal) {
					if (!cancelled) {
						setMissingGoal(true);
					}
					return;
				}

				if (!cancelled) {
					setFormState({
						title: goal.title,
						frequency: goal.frequency,
						endDate: goal.endDate,
					});
					setMissingGoal(false);
					setErrorMessage('');
				}
			} catch (error) {
				if (!cancelled) {
					setErrorMessage(error.message);
				}
			}
		}

		loadGoal();

		return () => {
			cancelled = true;
		};
	}, [goalId]);

	const handleChange = (event) => {
		const { name, value } = event.target;
		setFormState((current) => ({ ...current, [name]: value }));
	};

	const handleSubmit = async (event) => {
		event.preventDefault();

		try {
			await updateGoal(goalId, {
				id: goalId,
				title: formState.title.trim(),
				frequency: formState.frequency.trim(),
				endDate: formState.endDate,
			});
			await publishGoalNotification(
				`Updated goal "${formState.title.trim()}"`,
				'info',
			);

			router.push('/goals');
		} catch (error) {
			setErrorMessage(error.message);
		}
	};

	return (
		<GoalForm
			formState={formState}
			onChange={handleChange}
			onSubmit={handleSubmit}
			submitLabel="Update Goal"
			title="Edit Goal"
			description="Adjust the goal title, target frequency, and end date."
			missingGoal={missingGoal}
			errorMessage={errorMessage}
		/>
	);
}

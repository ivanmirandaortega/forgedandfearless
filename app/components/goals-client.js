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

	useEffect(() => {
		let cancelled = false;

		async function loadGoals() {
			try {
				const nextGoals = await fetchGoals();

				if (!cancelled) {
					setGoals(nextGoals);
					setErrorMessage('');
				}
			} catch (error) {
				if (!cancelled) {
					setErrorMessage(error.message);
				}
			}
		}

		loadGoals();

		return () => {
			cancelled = true;
		};
	}, []);

	const handleDelete = async () => {
		if (!deleteCandidate) {
			return;
		}

		try {
			await deleteGoal(deleteCandidate.id);
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
			<CheckInHeader />
			<StreakRow />

			<section className="goals-content">
				{errorMessage ? (
					<p className="goal-form-error">{errorMessage}</p>
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

			<BottomNav active="goals" />

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

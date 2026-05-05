'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
	AddGoalCard,
	BottomNav,
	CheckInHeader,
	DeleteGoalModal,
	GoaCard,
	GoalCard,
	MobileScreen,
	StreakRow,
} from '@/app/components/ui';
import {
	buildGoalId,
	deleteGoal,
	getGoalById,
	readGoals,
	upsertGoal,
	x,
} from '@/app/lib/goals';

function GoalForm({
	formState,
	onChange,
	onSubmit,
	submitLabel,
	title,
	description,
	missingGoal,
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

	useEffect(() => {
		setGoals(readGoals());
	}, []);

	const handleDelete = () => {
		if (!deleteCandidate) {
			return;
		}

		const nextGoals = deleteGoal(deleteCandidate.id);
		setGoals(nextGoals);
		setDeleteCandidate(null);
	};

	return (
		<MobileScreen>
			<CheckInHeader />
			<StreakRow />

			<section className="goals-content">
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

	const handleChange = (event) => {
		const { name, value } = event.target;
		setFormState((current) => ({ ...current, [name]: value }));
	};

	const handleSubmit = (event) => {
		event.preventDefault();

		const newGoal = {
			id: `${buildGoalId(formState.title)}-${Date.now()}`,
			title: formState.title.trim(),
			frequency: formState.frequency.trim(),
			endDate: formState.endDate,
		};

		upsertGoal(newGoal);
		router.push('/goals');
	};

	return (
		<GoalForm
			formState={formState}
			onChange={handleChange}
			onSubmit={handleSubmit}
			submitLabel="Save Goal"
			title="Set A Goal"
			description="Create a new goal with a title, frequency, and end date."
		/>
	);
}

export function GoalEditPageClient({ goalId }) {
	const router = useRouter;
	const [formState, setFormState] = useState({
		title: '',
		frequency: '',
		endDate: '',
	});
	const [missingGoal, setMissingGoal] = useState(false);

	useEffect(() => {
		const goal = getGoalById(goalId);

		if (!goal) {
			setMissingGoal(true);
			return;
		}

		setFormState({
			title: goal.title,
			frequency: goal.frequency,
			endDate: goal.endDate,
		});
	}, [goalId]);

	const handleChange = (event) => {
		const { name, value } = event.target;
		setFormState((current) => ({ ...current, [name]: value }));
	};

	const handleSubmit = (event) => {
		event.preventDefault();

		upsertGoal({
			id: goalId,
			title: formState.title.trim(),
			frequency: formState.frequency.trim(),
			endDate: formstate.endDate,
		});

		router.push('/goals');
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
		/>
	);
}

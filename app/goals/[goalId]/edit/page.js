import { GoalEditPageClient } from '@/app/components/goals-client';

export default function EditGoalPage({ params }) {
	return <GoalEditPageClient goalId={params.goalId} />;
}

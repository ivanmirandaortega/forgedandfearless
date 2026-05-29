import { GoalEditPageClient } from '@/app/components/goals-client';

export default async function EditGoalPage({ params }) {
	const { goalId } = await params;
	return <GoalEditPageClient goalId={goalId} />;
}

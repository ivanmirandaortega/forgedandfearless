import Link from 'next/link';
import { BottomNav, MobileScreen } from '@/app/components/ui';

export default function HelpPage() {
	return (
		<MobileScreen>
			<section className="goal-form-header">
				<Link className="back-link" href="/">
					Back
				</Link>
				<div>
					<h1>Help</h1>
					<p>How this app works and what features are available</p>
				</div>
			</section>

			<section className="help-card">
				<h2>Purpose</h2>
				<p>
					This app is designed to help you set fitness goals and track them over
					time. You can create a goal, update it as your routine changes, and
					use the daily check in to stay consistent.
				</p>
			</section>

			<section className="help-card">
				<h2>Goals</h2>
				<p>
					Go to the goals page to add a goal title, a target frequency like{' '}
					<strong>3x per week</strong>, and an end date. You can also edit or
					delete existing goals from that screen.
				</p>
			</section>

			<section className="help-card">
				<h2>Check In</h2>
				<p>
					When you are at the gym, use the <strong>Check In</strong> button on
					the home page or the middle button in the bottom navigation. This
					check in will act as proof that you made it to the gym for that
					session.
				</p>
			</section>

			<BottomNav active="help" />
		</MobileScreen>
	);
}

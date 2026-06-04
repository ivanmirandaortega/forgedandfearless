import Link from 'next/link';
import { BottomNav, MobileScreen } from '@/app/components/ui';
import { CheckInOverview } from '@/app/components/check-ins-client';

export default function HomePage() {
	return (
		<MobileScreen>
			<CheckInOverview />

			<section className="challenge-card">
				<div className="challenge-content">
					<h2>
						TRAIN. <br /> GET REWARDS.
					</h2>
					<p>Set training challenges and gain rewards.</p>
					<Link className="challenge-cta" href="/goals">
						Start Challenge
					</Link>
				</div>
			</section>

			<BottomNav active="home" />
		</MobileScreen>
	);
}

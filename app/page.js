import Link from 'next/link';
import {
	BottomNav,
	CheckInHeader,
	MobileScreen,
	StreakRow,
} from '@/app/components/ui';

export default function HomePage() {
	return (
		<MobileScreen>
			<CheckInHeader />
			<StreakRow />

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

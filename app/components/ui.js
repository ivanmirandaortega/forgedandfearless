import Link from 'next/link';
import { formatGoalDate } from '@/app/lib/goals';

// streak day icon changes bassed on weather the day is upcoming, complete, or missed
export const streakDays = [
	{ day: 1, status: 'upcoming' },
	{ day: 2, status: 'upcoming' },
	{ day: 3, status: 'upcoming' },
	{ day: 4, status: 'upcoming' },
	{ day: 5, status: 'upcoming' },
	{ day: 6, status: 'upcoming' },
	{ day: 8, status: 'upcoming' },
	{ day: 7, status: 'upcoming' },
	{ day: 9, status: 'upcoming' },
];

// streak check icon svg
function CheckIcon() {
	return (
		<svg aria-hidden="true" viewBox="0 0 16 16">
			<path
				d="M3 8.2 6.2 11.5 13 4.7"
				fill="none"
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2.2"
			/>
		</svg>
	);
}

// streak x icon svg
function XIcon() {
	return (
		<svg aria-hidden="true" viewBox="0 0 16 16">
			<path
				d="M4 4 12 12M12 4 4 12"
				fill="none"
				stroke="currentColor"
				strokeLinecap="round"
				strokeWidth="2.1"
			/>
		</svg>
	);
}

// day pill container
function DayPill({ day, status }) {
	return (
		<div className="day-pill">
			<span className="day-number">{day}</span>
			{status === 'complete' && (
				<span
					className="day-mark day-mark-complete"
					aria-label={`Day ${day} complete`}
				>
					<CheckIcon />
				</span>
			)}
			{status === 'missed' && (
				<span
					className="day-mark day-mark-missed"
					aria-label={`Day ${day} missed`}
				>
					<XIcon />
				</span>
			)}
			{(status === 'current' || status === 'upcoming') && (
				<span
					className={`day-dot${status === 'curent' ? 'day-dot-current' : ''}`}
				/>
			)}
		</div>
	);
}

// goal edit icon
function PencilIcon() {
	return (
		<svg aria-hidden="true" viewBox="0 0 24 24">
			<path
				d="m4.5 16.9 8.9-8.9 2.7 2.7-8.9 8.9-3.7 1z"
				fill="none"
				stroke="currentColor"
				strokeLinejoin="round"
				strokeWidth="1.9"
			/>
			<path
				d="m12.7 8.7 1.7-1.7a2 2 0 0 1 2.8 0l.8.8a2 2 0 0 1 0 2.8l-1.7 1.7"
				fill="none"
				stroke="currentColor"
				strokeLinejoin="round"
				strokeWidth="1.9"
			/>
		</svg>
	);
}

// goal delete icon
function TrashIcon() {
	return (
		<svg aria-hidden="true" viewBox="0 0 24 24">
			<path
				d="M5 7.5h14M9 7.5V5.8c0-.7.6-1.3 1.3-1.3h3.4c.7 0 1.3.6 1.3 1.3v1.7m-8.6 0 .7 10.4c.1.8.7 1.4 1.5 1.4h6.8c.8 0 1.4-.6 1.5-1.4l.7-10.4M10.2 10.2v5.8M13.8 10.2v5.8"
				fill="none"
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="1.9"
			/>
		</svg>
	);
}

function PlusIcon() {
	return (
		<svg>
			<path
				d="M12 5.5v13M5.5 12h13"
				fill="none"
				stroke="currentColor"
				strokeLinecap="round"
				strokeWidth="1.9"
			/>
		</svg>
	);
}

// bottom nav home icon
function HomeIcon() {
	return (
		<svg aria-hidden="true" viewBox="0 0 24 24">
			<path
				d="M4.5 10.7 12 4.5l7.5 6.2v8a1.3 1.3 0 0 1-1.3 1.3h-3.9v-6h-4.6v6H5.8a1.3 1.3 0 0 1-1.3-1.3z"
				fill="none"
				stroke="currentColor"
				strokeLinejoin="round"
				strokeWidth="1.9"
			/>
		</svg>
	);
}

// bottom nav goal icon
function GoalIcon() {
	return (
		<svg aria-hidden="true" viewBox="0 0 24 24">
			<path
				d="M12 4.2a7.8 7.8 0 1 0 7.8 7.8A7.8 7.8 0 0 0 12 4.2Zm0 12.4a4.6 4.6 0 1 1 4.6-4.6 4.6 4.6 0 0 1-4.6 4.6Z"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.8"
			/>
		</svg>
	);
}

// bottom nav location icon
function LocationIcon() {
	return (
		<svg aria-hidden="true" viewBox="0 0 24 24">
			<path
				d="M12 21s6-5.5 6-10.2A6 6 0 1 0 6 10.8C6 15.5 12 21 12 21Z"
				fill="none"
				stroke="currentColor"
				strokeLinejoin="round"
				strokeWidth="1.8"
			/>
			<circle
				cx="12"
				cy="10.5"
				r="1.9"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.8"
			/>
		</svg>
	);
}

// bottom nav reward icon
function RewardIcon() {
	return (
		<svg aria-hidden="true" viewBox="0 0 24 24">
			<path
				d="M12 4.2 14 8.3l4.5.7-3.2 3.2.8 4.6L12 14.7 7.9 16.8l.8-4.6L5.5 9l4.5-.7z"
				fill="none"
				stroke="currentColor"
				strokeLinejoin="round"
				strokeWidth="1.7"
			/>
			<path
				d="M9.3 16.3 8.4 20l3.6-2.1L15.6 20l-.9-3.7"
				fill="none"
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="1.7"
			/>
		</svg>
	);
}

// bottom nav user profile icon
function UserIcon() {
	return (
		<svg>
			<circle
				cx="12"
				cy="8"
				r="3.2"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.8"
			/>
			<path
				d="M5.5 19.5c1.5-3.2 4-4.8 6.5-4.8s5 1.6 6.5 4.8"
				fill="none"
				stroke="currentColor"
				strokeLinecap="round"
				strokeWidth="1.8"
			/>
		</svg>
	);
}

// Nav link component
function NavItem({ href, label, active = false, children }) {
	return (
		<Link
			className={`bottom-nav-item ${active ? 'bottom-nav-item-active' : ''}`}
			href={href}
			aria-label={label}
		>
			{children}
		</Link>
	);
}

// mobile container
export function MobileScreen({ children }) {
	return (
		<main className="mobile-shell">
			<section className="mobile-screen">{children}</section>
		</main>
	);
}

// check in header component
export function CheckInHeader() {
	return (
		<section className="hero-copy">
			<p className="eyebrow">Daily Check In</p>
			<div className="hero-heading-row">
				<h1>DAY 5/300</h1>
				<Link className="help-link" href="/help">
					Help
				</Link>
			</div>
		</section>
	);
}

// streat days component
export function StreakRow() {
	return (
		<section className="streak-row" aria-label="Daily streak">
			{streakDays.map((item) => (
				<DayPill key={item.day} day={item.day} status={item.status} />
			))}
		</section>
	);
}

// goal card component
export function GoalCard({ goal, onEdit, onDelete }) {
	return (
		<article className="goal-card">
			<div className="goal-card-badge" aria-hidden="true"></div>
			<div className="goal-card-copy">
				<h2>{goal.title}</h2>
				<p>{goal.frequency}</p>
				<span className="goal-card-meta">
					Ends {formatGoalDate(goal.endDate)}
				</span>
			</div>
			<div className="goal-card-actions">
				<button
					className="goal-action-button"
					type="button"
					aria-label="Edit goal"
					onClick={onEdit}
				>
					<PencilIcon />
				</button>
				<button
					className="goal-action-button"
					type="button"
					aria-label="Delete goal"
					onClick={onDelete}
				>
					<TrashIcon />
				</button>
			</div>
		</article>
	);
}

// bottom nav component
export function BottomNav({ active = 'home' }) {
	return (
		<nav className="bottom-nav" aria-label="Primary">
			<NavItem href="/" label="Home" active={active === 'home'}>
				<HomeIcon />
			</NavItem>
			<NavItem href="/goals" label="Goals" active={active === 'goals'}>
				<GoalIcon />
			</NavItem>
			<NavItem href="#" label="Check In" active={active === 'checkin'}>
				<LocationIcon />
			</NavItem>
			<NavItem href="#" label="Rewards" active={active === 'rewards'}>
				<RewardIcon />
			</NavItem>
			<NavItem href="#" label="Profile" active={active === 'rewards'}>
				<UserIcon />
			</NavItem>
		</nav>
	);
}

export function AddGoalCard() {
	return (
		<Link className="add-goal-card" href="/goals/new">
			<span className="add-goal-icon">
				<PlusIcon />
			</span>
			<span>Add Goal</span>
		</Link>
	);
}

export function DeleteGoalModal({ onDelete, onCancel }) {
	return (
		<div className="goal-modal-backdrop">
			<div className="goal-modal">
				<h2 id="delete-goal-title">Are You Sure You Want to Delete?</h2>
				<p id="delete-goal-description">
					Deleting the goal will result in loss of goal data and potential
					rewards.
				</p>
				<div className="goal-modal-actions">
					<button
						className="goal-modal-button goal-modal-button-secondary"
						type="button"
						onClick={onDelete}
					>
						Delete
					</button>
					<button
						className="goal-modal-button goal-modal-button-primary"
						type="button"
						onClick={onCancel}
					>
						Cancel
					</button>
				</div>
			</div>
		</div>
	);
}

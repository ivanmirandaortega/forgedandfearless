import './globals.css';

export const metadata = {
	title: 'CS361 Main Program',
	description: 'Fitness Goals App',
};

export default function RootLayout({ children }) {
	return (
		<html lang="en">
			<body>{children}</body>
		</html>
	);
}

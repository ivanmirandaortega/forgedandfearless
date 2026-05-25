require('dotenv').config();

const app = require('./app');
const connectToDatabase = require('./config/db');

const port = Number(process.env.PORT || 4000);

async function startServer() {
	try {
		await connectToDatabase();

		app.listen(port, () => {
			console.log(`API lisetning on http://localhost:${port}`);
		});
	} catch (error) {
		console.error('Failed to start API', error);
		process.exit(1);
	}
}

startServer();

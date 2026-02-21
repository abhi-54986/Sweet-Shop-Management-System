import app from '../backend/src/app';
import connectDB from '../backend/src/config/database';

connectDB().catch((error) => {
	console.error('❌ Failed to connect MongoDB in serverless function:', error);
});

export default app;

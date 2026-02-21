import app from '../backend/src/app';
import connectDB from '../backend/src/config/database';
import type { Request, Response } from 'express';

export default async function handler(req: Request, res: Response) {
	try {
		await connectDB();
		return app(req, res);
	} catch (error: any) {
		console.error('❌ Failed to connect MongoDB in serverless function:', error);
		return res.status(500).json({
			message: 'Database connection failed',
			error: error?.message || 'Unknown error',
		});
	}
}

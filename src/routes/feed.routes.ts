import { Router } from 'express';
import { FeedController } from '../controllers/feed.controller';
import { authMiddleware } from '../middleware/auth.middleware'; // Assuming auth middleware exists

export const feedRouter = Router();
const feedController = new FeedController();

// Get user's personalized feed (requires authentication)
feedRouter.get('/', authMiddleware, feedController.getUserFeed.bind(feedController));
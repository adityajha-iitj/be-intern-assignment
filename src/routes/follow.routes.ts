import { Router } from 'express';
import { validate } from '../middleware/validation.middleware';
import { createFollowSchema } from '../validations/follow.validation';
import { FollowController } from '../controllers/follow.controller';
import { authMiddleware } from '../middleware/auth.middleware'; // Assuming auth middleware exists

export const followRouter = Router();
const followController = new FollowController();

// Get all follows
followRouter.get('/', followController.getAllFollows.bind(followController));

// Get follow by id
followRouter.get('/:id', followController.getFollowById.bind(followController));

// Create new follow (requires authentication)
followRouter.post('/', authMiddleware, validate(createFollowSchema), followController.createFollow.bind(followController));

// Delete follow (requires authentication)
followRouter.delete('/:id', authMiddleware, followController.deleteFollow.bind(followController));

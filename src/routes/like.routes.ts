import { Router } from 'express';
import { validate } from '../middleware/validation.middleware';
import { createLikeSchema } from '../validations/like.validation';
import { LikeController } from '../controllers/like.controller';
import { authMiddleware } from '../middleware/auth.middleware'; // Assuming auth middleware exists

export const likeRouter = Router();
const likeController = new LikeController();

// Get all likes
likeRouter.get('/', likeController.getAllLikes.bind(likeController));

// Get like by id
likeRouter.get('/:id', likeController.getLikeById.bind(likeController));

// Create new like (requires authentication)
likeRouter.post('/', authMiddleware, validate(createLikeSchema), likeController.createLike.bind(likeController));

// Delete like (requires authentication)
likeRouter.delete('/:id', authMiddleware, likeController.deleteLike.bind(likeController));
import { Router } from 'express';
import { validate } from '../middleware/validation.middleware';
import { createPostSchema, updatePostSchema } from '../validations/post.validation';
import { PostController } from '../controllers/post.controller';
import { authMiddleware } from '../middleware/auth.middleware'; // Assuming auth middleware exists

export const postRouter = Router();
const postController = new PostController();

// Get all posts
postRouter.get('/', postController.getAllPosts.bind(postController));

// Get post by id
postRouter.get('/:id', postController.getPostById.bind(postController));

// Create new post (requires authentication)
postRouter.post('/', authMiddleware, validate(createPostSchema), postController.createPost.bind(postController));

// Update post (requires authentication)
postRouter.put('/:id', authMiddleware, validate(updatePostSchema), postController.updatePost.bind(postController));

// Delete post (requires authentication)
postRouter.delete('/:id', authMiddleware, postController.deletePost.bind(postController));

// Special endpoint: Get posts by hashtag
postRouter.get('/hashtag/:tag', postController.getPostsByHashtag.bind(postController));
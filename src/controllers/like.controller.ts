import { Request, Response } from 'express';
import { Like } from '../entities/Like';
import { Post } from '../entities/Post';
import { User } from '../entities/User';
import { AppDataSource } from '../data-source';

export class LikeController {
  private likeRepository = AppDataSource.getRepository(Like);
  private postRepository = AppDataSource.getRepository(Post);
  private userRepository = AppDataSource.getRepository(User);

  async getAllLikes(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;

      const [likes, total] = await this.likeRepository.findAndCount({
        relations: ['user', 'post'],
        order: { createdAt: 'DESC' },
        take: limit,
        skip: offset,
      });

      res.json({
        data: likes,
        meta: {
          total,
          limit,
          offset,
        },
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching likes', error });
    }
  }

  async getLikeById(req: Request, res: Response) {
    try {
      const like = await this.likeRepository.findOne({
        where: { id: parseInt(req.params.id) },
        relations: ['user', 'post'],
      });

      if (!like) {
        return res.status(404).json({ message: 'Like not found' });
      }

      res.json(like);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching like', error });
    }
  }

  async createLike(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { postId } = req.body;

      // Check if user exists
      const user = await this.userRepository.findOneBy({ id: userId });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if post exists
      const post = await this.postRepository.findOneBy({ id: postId });
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      // Check if like already exists
      const existingLike = await this.likeRepository.findOne({
        where: {
          user: { id: userId },
          post: { id: postId },
        },
      });

      if (existingLike) {
        return res.status(409).json({ message: 'You have already liked this post' });
      }

      // Create and save the like
      const like = this.likeRepository.create({
        user,
        post,
      });

      const result = await this.likeRepository.save(like);

      // Update post like count
      post.likeCount += 1;
      await this.postRepository.save(post);

      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ message: 'Error creating like', error });
    }
  }

  async deleteLike(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const likeId = parseInt(req.params.id);

      const like = await this.likeRepository.findOne({
        where: { id: likeId },
        relations: ['user', 'post'],
      });

      if (!like) {
        return res.status(404).json({ message: 'Like not found' });
      }

      // If user is deleting their own like
      if (like.user.id !== userId) {
        return res.status(403).json({ message: 'You can only delete your own likes' });
      }

      // Update post like count
      const post = like.post;
      post.likeCount = Math.max(0, post.likeCount - 1); // Ensure count doesn't go below 0
      await this.postRepository.save(post);

      // Remove the like
      await this.likeRepository.remove(like);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Error deleting like', error });
    }
  }
}
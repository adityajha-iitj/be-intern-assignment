import { Request, Response } from 'express';
import { Follow } from '../entities/Follow';
import { User } from '../entities/User';
import { Post } from '../entities/Post';
import { Like } from '../entities/Like';
import { AppDataSource } from '../data-source';

// Activity types for the feed
type ActivityType = 'post' | 'like' | 'follow' | 'unfollow';

interface Activity {
  type: ActivityType;
  createdAt: Date;
  data: {
    // Post activity
    postId?: number;
    content?: string;
    likeCount?: number;
    
    // Like activity
    postContent?: string;
    authorId?: number;
    
    // Follow activity
    followedUserId?: number;
    firstName?: string;
    lastName?: string;
  };
}

export class FollowController {
  private followRepository = AppDataSource.getRepository(Follow);
  private userRepository = AppDataSource.getRepository(User);
  private postRepository = AppDataSource.getRepository(Post);
  private likeRepository = AppDataSource.getRepository(Like);

  async getAllFollows(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;

      const [follows, total] = await this.followRepository.findAndCount({
        relations: ['follower', 'following'],
        order: { createdAt: 'DESC' },
        take: limit,
        skip: offset,
      });

      res.json({
        data: follows,
        meta: {
          total,
          limit,
          offset,
        },
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching follows', error });
    }
  }

  async getFollowById(req: Request, res: Response) {
    try {
      const follow = await this.followRepository.findOne({
        where: { id: parseInt(req.params.id) },
        relations: ['follower', 'following'],
      });

      if (!follow) {
        return res.status(404).json({ message: 'Follow relationship not found' });
      }

      res.json(follow);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching follow relationship', error });
    }
  }

  async createFollow(req: Request, res: Response) {
    try {
      const followerId = (req as any).user.id;
      const { followingId } = req.body;

      // Prevent self-following
      if (followerId === followingId) {
        return res.status(400).json({ message: 'You cannot follow yourself' });
      }

      // Check if follower exists
      const follower = await this.userRepository.findOneBy({ id: followerId });
      if (!follower) {
        return res.status(404).json({ message: 'Follower user not found' });
      }

      // Check if following user exists
      const following = await this.userRepository.findOneBy({ id: followingId });
      if (!following) {
        return res.status(404).json({ message: 'User to follow not found' });
      }

      // Check if follow relationship already exists
      const existingFollow = await this.followRepository.findOne({
        where: {
          follower: { id: followerId },
          following: { id: followingId },
        },
      });

      if (existingFollow) {
        return res.status(409).json({ message: 'You are already following this user' });
      }

      const follow = this.followRepository.create({
        follower,
        following,
      });

      const result = await this.followRepository.save(follow);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ message: 'Error creating follow relationship', error });
    }
  }

  async deleteFollow(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const followId = parseInt(req.params.id);

      const follow = await this.followRepository.findOne({
        where: { id: followId },
        relations: ['follower'],
      });

      if (!follow) {
        return res.status(404).json({ message: 'Follow relationship not found' });
      }

      if (follow.follower.id !== userId) {
        return res.status(403).json({ message: 'You can only delete your own follow relationships' });
      }

      await this.followRepository.remove(follow);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Error deleting follow relationship', error });
    }
  }
}
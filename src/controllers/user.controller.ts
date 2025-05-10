import { Request, Response } from 'express';
import { User } from '../entities/User';
import { AppDataSource } from '../data-source';
import { Post } from '../entities/Post';
import { Like } from '../entities/Like';
import { Follow } from '../entities/Follow';
import { Between, In, IsNull } from 'typeorm';

export class UserController {
  private userRepository = AppDataSource.getRepository(User);
  private postRepository = AppDataSource.getRepository(Post);
  private likeRepository = AppDataSource.getRepository(Like);
  private followRepository = AppDataSource.getRepository(Follow);

  async getAllUsers(req: Request, res: Response) {
    try {
      const users = await this.userRepository.find();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching users', error });
    }
  }

  async getUserById(req: Request, res: Response) {
    try {
      const user = await this.userRepository.findOneBy({
        id: parseInt(req.params.id),
      });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching user', error });
    }
  }

  async createUser(req: Request, res: Response) {
    try {
      const user = this.userRepository.create(req.body);
      const result = await this.userRepository.save(user);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ message: 'Error creating user', error });
    }
  }

  async updateUser(req: Request, res: Response) {
    try {
      const user = await this.userRepository.findOneBy({
        id: parseInt(req.params.id),
      });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      this.userRepository.merge(user, req.body);
      const result = await this.userRepository.save(user);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: 'Error updating user', error });
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      const result = await this.userRepository.delete(parseInt(req.params.id));
      if (result.affected === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Error deleting user', error });
    }
  }

  async getUserFollowers(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.id);
      
      // Check if user exists
      const user = await this.userRepository.findOneBy({ id: userId });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;

      // Query for followers
      const followersQuery = this.followRepository.createQueryBuilder('follow')
        .leftJoinAndSelect('follow.follower', 'follower')
        .where('follow.following.id = :userId', { userId })
        .orderBy('follow.createdAt', 'DESC')
        .skip(offset)
        .take(limit);
      
      // Get followers and count
      const [followData, totalCount] = await followersQuery.getManyAndCount();
      
      // Format the response
      const followers = followData.map(follow => ({
        id: follow.follower.id,
        firstName: follow.follower.firstName,
        lastName: follow.follower.lastName,
        email: follow.follower.email,
        followedAt: follow.createdAt
      }));
      
      // Pagination
      const hasMore = offset + followers.length < totalCount;
      const nextOffset = hasMore ? offset + limit : null;
      
      res.json({
        followers,
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore,
          nextOffset
        }
      });
      
    } catch (error: any) {
      res.status(500).json({ 
        message: 'Error fetching user followers', 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  }

  async getUserActivity(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.id);
      
      // Check if user exists
      const user = await this.userRepository.findOneBy({ id: userId });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Parse query parameters
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;
      
      // Parse activity type filter
      const activityTypes = req.query.types ? 
        (Array.isArray(req.query.types) ? req.query.types : [req.query.types]) : 
        ['post', 'like', 'follow'];
      
      // Parse date range filter
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : null;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : null;
      
      const dateFilter = startDate && endDate ? 
        Between(startDate, endDate) : 
        undefined;

      // Prepare arrays to store different activity types
      let activities = [];
      let totalCount = 0;

      // Get user posts if requested
      if (activityTypes.includes('post')) {
        const postsQuery = this.postRepository.createQueryBuilder('post')
          .where('post.author.id = :userId', { userId });
        
        if (dateFilter) {
          postsQuery.andWhere('post.createdAt BETWEEN :startDate AND :endDate', { 
            startDate, 
            endDate 
          });
        }
        
        const [posts, postCount] = await postsQuery
          .select([
            'post.id', 
            'post.content', 
            'post.createdAt'
          ])
          .orderBy('post.createdAt', 'DESC')
          .getManyAndCount();
        
        activities.push(...posts.map(post => ({
          type: 'post',
          action: 'created',
          id: post.id,
          content: post.content,
          createdAt: post.createdAt
        })));
        
        totalCount += postCount;
      }

      // Get user likes if requested
      if (activityTypes.includes('like')) {
        const likesQuery = this.likeRepository.createQueryBuilder('like')
          .where('like.user.id = :userId', { userId })
          .leftJoinAndSelect('like.post', 'post');
        
        if (dateFilter) {
          likesQuery.andWhere('like.createdAt BETWEEN :startDate AND :endDate', { 
            startDate, 
            endDate 
          });
        }
        
        const [likes, likeCount] = await likesQuery
          .select([
            'like.id', 
            'like.createdAt', 
            'post.id', 
            'post.content'
          ])
          .orderBy('like.createdAt', 'DESC')
          .getManyAndCount();
        
        activities.push(...likes.map(like => ({
          type: 'like',
          action: 'liked',
          id: like.id,
          postId: like.post.id,
          postContent: like.post.content,
          createdAt: like.createdAt
        })));
        
        totalCount += likeCount;
      }

      // Get user follows if requested
      if (activityTypes.includes('follow')) {
        const followsQuery = this.followRepository.createQueryBuilder('follow')
          .where('follow.follower.id = :userId', { userId })
          .leftJoinAndSelect('follow.following', 'following');
        
        if (dateFilter) {
          followsQuery.andWhere('follow.createdAt BETWEEN :startDate AND :endDate', { 
            startDate, 
            endDate 
          });
        }
        
        const [follows, followCount] = await followsQuery
          .select([
            'follow.id', 
            'follow.createdAt',
            'following.id',
            'following.firstName',
            'following.lastName'
          ])
          .orderBy('follow.createdAt', 'DESC')
          .getManyAndCount();
        
        activities.push(...follows.map(follow => ({
          type: 'follow',
          action: 'followed',
          id: follow.id,
          followingId: follow.following.id,
          followingName: `${follow.following.firstName} ${follow.following.lastName}`,
          createdAt: follow.createdAt
        })));
        
        totalCount += followCount;
      }

      // Sort all activities by creation date (newest first)
      activities.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      // Pagination
      const paginatedActivities = activities.slice(offset, offset + limit);

      // Calculate pagination metadata
      const totalPages = Math.ceil(totalCount / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;
      
      res.json({
        activities: paginatedActivities,
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages,
          hasNextPage,
          hasPrevPage
        }
      });
    } catch (error: any) {
      res.status(500).json({ 
        message: 'Error fetching user activity', 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
}

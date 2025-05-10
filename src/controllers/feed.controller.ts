import { Request, Response } from 'express';
import { Post } from '../entities/Post';
import { AppDataSource } from '../data-source';
import { Follow } from '../entities/Follow';
import { User } from '../entities/User';

export class FeedController {
  private postRepository = AppDataSource.getRepository(Post);
  private followRepository = AppDataSource.getRepository(Follow);
  private userRepository = AppDataSource.getRepository(User);


  async getUserFeed(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      
      // Check if user exists
      const user = await this.userRepository.findOneBy({ id: userId });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Parse pagination parameters
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;

      // Right now finding all users that the current user follows
      const followsQuery = this.followRepository.createQueryBuilder('follow')
        .leftJoinAndSelect('follow.following', 'following')
        .where('follow.follower.id = :userId', { userId });
        
      const follows = await followsQuery.getMany();

      // If user doesn't follow anyone, return empty result
      if (follows.length === 0) {
        return res.json({
          data: [],
          pagination: {
            total: 0,
            limit,
            offset,
            hasMore: false,
            nextOffset: null
          }
        });
      }

      // Extract the IDs of followed users
      const followedUserIds = follows.map(follow => follow.following.id);

      // Now finding posts from those users
      const postsQuery = this.postRepository.createQueryBuilder('post')
        .leftJoinAndSelect('post.author', 'author')
        .leftJoinAndSelect('post.hashtags', 'hashtags')
        .where('author.id IN (:...followedUserIds)', { followedUserIds })
        .orderBy('post.createdAt', 'DESC')
        .skip(offset)
        .take(limit);

      const [posts, total] = await postsQuery.getManyAndCount();

      // Pagination
      const hasMore = offset + posts.length < total;
      const nextOffset = hasMore ? offset + limit : null;

      res.json({
        data: posts,
        pagination: {
          total,
          limit,
          offset,
          hasMore,
          nextOffset
        }
      });
    } catch (error: any) {
      res.status(500).json({ 
        message: 'Error fetching user feed', 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
}
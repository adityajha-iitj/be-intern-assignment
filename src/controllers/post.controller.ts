import { Request, Response } from 'express';
import { Post } from '../entities/Post';
import { Hashtag } from '../entities/Hashtag';
import { User } from '../entities/User';
import { AppDataSource } from '../data-source';
import { Like as TypeormLike } from 'typeorm';

export class PostController {
  private postRepository = AppDataSource.getRepository(Post);
  private hashtagRepository = AppDataSource.getRepository(Hashtag);
  private userRepository = AppDataSource.getRepository(User);

  async getAllPosts(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;

      const [posts, total] = await this.postRepository.findAndCount({
        relations: ['author', 'hashtags'],
        order: { createdAt: 'DESC' },
        take: limit,
        skip: offset,
      });

      res.json({
        data: posts,
        meta: {
          total,
          limit,
          offset,
        },
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching posts', error });
    }
  }

  async getPostById(req: Request, res: Response) {
    try {
      const post = await this.postRepository.findOne({
        where: { id: parseInt(req.params.id) },
        relations: ['author', 'hashtags'],
      });

      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      res.json(post);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching post', error });
    }
  }

  async createPost(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const user = await this.userRepository.findOneBy({ id: userId });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const { content, hashtags } = req.body;
      const post = this.postRepository.create({
        content,
        author: user,
      });

      // Handle hashtags if provided
      if (hashtags && hashtags.length > 0) {
        const hashtagEntities = [];
        
        for (const tag of hashtags) {
          // Find or create each hashtag
          let hashtag = await this.hashtagRepository.findOneBy({ tag });
          
          if (!hashtag) {
            hashtag = this.hashtagRepository.create({ tag });
            await this.hashtagRepository.save(hashtag);
          }
          
          hashtagEntities.push(hashtag);
        }
        
        post.hashtags = hashtagEntities;
      }

      const result = await this.postRepository.save(post);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ message: 'Error creating post', error });
    }
  }

  async updatePost(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      
      const post = await this.postRepository.findOne({
        where: { id: parseInt(req.params.id) },
        relations: ['author', 'hashtags'],
      });

      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      // Ensure user is the author of the post
      if (post.author.id !== userId) {
        return res.status(403).json({ message: 'You can only update your own posts' });
      }

      const { content, hashtags } = req.body;
      
      if (content) {
        post.content = content;
      }

      // Update hashtags if provided
      if (hashtags && hashtags.length > 0) {
        const hashtagEntities = [];
        
        for (const tag of hashtags) {
          // Find or create each hashtag
          let hashtag = await this.hashtagRepository.findOneBy({ tag });
          
          if (!hashtag) {
            hashtag = this.hashtagRepository.create({ tag });
            await this.hashtagRepository.save(hashtag);
          }
          
          hashtagEntities.push(hashtag);
        }
        
        post.hashtags = hashtagEntities;
      }

      const result = await this.postRepository.save(post);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: 'Error updating post', error });
    }
  }

  async deletePost(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      
      const post = await this.postRepository.findOne({
        where: { id: parseInt(req.params.id) },
        relations: ['author'],
      });

      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      // Ensure user is the author of the post
      if (post.author.id !== userId) {
        return res.status(403).json({ message: 'You can only delete your own posts' });
      }

      await this.postRepository.remove(post);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Error deleting post', error });
    }
  }

  // Special endpoint: Get posts by hashtag
  async getPostsByHashtag(req: Request, res: Response) {
    try {
      const tag = req.params.tag;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;

      // Find posts with the given hashtag (case-insensitive)
      const hashtag = await this.hashtagRepository.findOne({
        where: { tag: TypeormLike(`%${tag}%`) },
        relations: ['posts', 'posts.author'],
      });

      if (!hashtag || !hashtag.posts.length) {
        return res.json({
          data: [],
          meta: {
            total: 0,
            limit,
            offset,
          },
        });
      }

      // Sort posts by creation date and apply pagination
      const posts = hashtag.posts
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(offset, offset + limit);

      res.json({
        data: posts,
        meta: {
          total: hashtag.posts.length,
          limit,
          offset,
        },
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching posts by hashtag', error });
    }
  }
}
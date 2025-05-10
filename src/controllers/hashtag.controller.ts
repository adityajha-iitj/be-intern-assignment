import { Request, Response } from 'express';
import { Hashtag } from '../entities/Hashtag';
import { AppDataSource } from '../data-source';
import { Like as TypeormLike } from 'typeorm';

export class HashtagController {
  private hashtagRepository = AppDataSource.getRepository(Hashtag);

  async getAllHashtags(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;

      const [hashtags, total] = await this.hashtagRepository.findAndCount({
        order: { tag: 'ASC' },
        take: limit,
        skip: offset,
      });

      res.json({
        data: hashtags,
        meta: {
          total,
          limit,
          offset,
        },
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching hashtags', error });
    }
  }

  async getHashtagById(req: Request, res: Response) {
    try {
      const hashtag = await this.hashtagRepository.findOneBy({
        id: parseInt(req.params.id),
      });

      if (!hashtag) {
        return res.status(404).json({ message: 'Hashtag not found' });
      }

      res.json(hashtag);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching hashtag', error });
    }
  }

  async createHashtag(req: Request, res: Response) {
    try {
      const { tag } = req.body;

      // Check if hashtag already exists (case insensitive)
      const existingHashtag = await this.hashtagRepository.findOne({
        where: { 
          tag: TypeormLike(tag) 
        },
      });

      if (existingHashtag) {
        return res.status(409).json({ message: 'Hashtag already exists' });
      }

      const hashtag = this.hashtagRepository.create({ tag });
      const result = await this.hashtagRepository.save(hashtag);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ message: 'Error creating hashtag', error });
    }
  }

  async updateHashtag(req: Request, res: Response) {
    try {
      const hashtag = await this.hashtagRepository.findOneBy({
        id: parseInt(req.params.id),
      });

      if (!hashtag) {
        return res.status(404).json({ message: 'Hashtag not found' });
      }

      const { tag } = req.body;

      if (tag && tag !== hashtag.tag) {
        // Check if the new tag already exists
        const existingHashtag = await this.hashtagRepository.findOne({
          where: { 
            tag: TypeormLike(tag) 
          },
        })

        if (existingHashtag) {
          return res.status(409).json({ message: 'Hashtag already exists' });
        }

        hashtag.tag = tag;
      }

      const result = await this.hashtagRepository.save(hashtag);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: 'Error updating hashtag', error });
    }
  }

  async deleteHashtag(req: Request, res: Response) {
    try {
      const result = await this.hashtagRepository.delete(parseInt(req.params.id));
      
      if (result.affected === 0) {
        return res.status(404).json({ message: 'Hashtag not found' });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Error deleting hashtag', error });
    }
  }

  async searchHashtags(req: Request, res: Response) {
    try {
      const query = req.query.q as string;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;

      if (!query) {
        return res.status(400).json({ message: 'Search query is required' });
      }

      const [hashtags, total] = await this.hashtagRepository.findAndCount({
        where: {
          tag: TypeormLike(`%${query}%`),
        },
        order: { tag: 'ASC' },
        take: limit,
        skip: offset,
      });

      res.json({
        data: hashtags,
        meta: {
          total,
          limit,
          offset,
        },
      });
    } catch (error) {
      res.status(500).json({ message: 'Error searching hashtags', error });
    }
  }

    async getPopularHashtags(req: Request, res: Response) {
    try {
        const limit = parseInt(req.query.limit as string) || 10;
        const offset = parseInt(req.query.offset as string) || 0;

        const queryBuilder = this.hashtagRepository
        .createQueryBuilder('hashtag')
        .leftJoin('hashtag.posts', 'post')
        .select([
            'hashtag.id',
            'hashtag.tag',
            'COUNT(post.id) as postCount'
        ])
        .groupBy('hashtag.id') // Group by primary key
        .orderBy('postCount', 'DESC')
        .addOrderBy('hashtag.tag', 'ASC')
        .limit(limit)
        .offset(offset);

        const hashtags = await queryBuilder.getRawMany(); //getRawMany() is used for custom selections

        // For total count (without pagination)
        const totalQuery = this.hashtagRepository
        .createQueryBuilder('hashtag')
        .leftJoin('hashtag.posts', 'post')
        .select('COUNT(DISTINCT hashtag.id)', 'count');
        
        const total = await totalQuery.getRawOne();

        res.json({
        data: hashtags,
        meta: {
            total: parseInt(total?.count || 0),
            limit,
            offset
        }
        });
    } catch (error) {
        console.error('Error in getPopularHashtags:', error); // Detailed logging
        res.status(500).json({ 
        message: 'Error fetching popular hashtags', 
        error: process.env.NODE_ENV === 'development' ? error : null 
        });
    }
  }
}
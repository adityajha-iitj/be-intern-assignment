import { Request, Response, NextFunction } from 'express';
import { User } from '../entities/User';
import { AppDataSource } from '../data-source';

// This middleware simply accepts a userId header and validates that
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.header('userId');
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOneBy({ id: parseInt(userId) });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    (req as any).user = user;
    
    next();
  } catch (error) {
    res.status(500).json({ message: 'Authentication error', error });
  }
};
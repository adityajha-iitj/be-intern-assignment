import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  Index,
  Unique,
} from 'typeorm';
import { User } from './User';
import { Post } from './Post';

@Entity('likes')
@Unique(['user', 'post']) // Ensure a user can only like a post once
export class Like {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => User, user => user.likes, { onDelete: 'CASCADE' })
  @Index() // Add index for user lookups
  user: User;

  @ManyToOne(() => Post, post => post.likes, { onDelete: 'CASCADE' })
  @Index() // Add index for post lookups
  post: Post;

  @CreateDateColumn()
  @Index() // Add index for sorting by creation date
  createdAt: Date;
}
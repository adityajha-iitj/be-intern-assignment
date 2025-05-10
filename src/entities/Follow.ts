import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  Index,
  Unique,
} from 'typeorm';
import { User } from './User';

@Entity('follows')
@Unique(['follower', 'following']) // Ensure a user can only follow another user once
export class Follow {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => User, user => user.following, { onDelete: 'CASCADE' })
  @Index() // Add index for follower lookups
  follower: User;

  @ManyToOne(() => User, user => user.followers, { onDelete: 'CASCADE' })
  @Index() // Add index for following lookups
  following: User;

  @CreateDateColumn()
  @Index() // Add index for sorting by creation date
  createdAt: Date;
}
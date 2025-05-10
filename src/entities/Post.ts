import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
  Index,
} from 'typeorm';
import { User } from './User';
import { Like } from './Like';
import { Hashtag } from './Hashtag';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'text' })
  content: string;

  @ManyToOne(() => User, user => user.posts, { onDelete: 'CASCADE' })
  @Index() // Add index for user lookups
  author: User;

  @OneToMany(() => Like, like => like.post)
  likes: Like[];

  @ManyToMany(() => Hashtag, hashtag => hashtag.posts)
  @JoinTable({
    name: 'post_hashtags',
    joinColumn: {
      name: 'post_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'hashtag_id',
      referencedColumnName: 'id',
    },
  })
  hashtags: Hashtag[];

  @Column({ type: 'int', default: 0 })
  likeCount: number;

  @CreateDateColumn()
  @Index() // Add index for sorting by creation date
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
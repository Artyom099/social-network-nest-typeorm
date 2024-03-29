import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { LikeStatus } from '../../../infrastructure/utils/enums';
import { Posts } from './post.entity';
import { Users } from '../../user/entity/user.entity';

@Entity()
export class PostLikes {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  addedAt: Date;
  @Column()
  status: LikeStatus;

  @ManyToOne(() => Posts, (p) => p.likes)
  @JoinColumn()
  post: Posts;
  @Column()
  postId: string;

  @ManyToOne(() => Users, (u) => u.post_likes)
  @JoinColumn()
  user: Users;
  @Column()
  userId: string;
  @Column()
  login: string;
}

import {Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from 'typeorm';
import {LikeStatus} from '../../../infrastructure/utils/constants';
import {Posts} from './post.entity';
import {Users} from '../../users/entity/user.entity';

@Entity()
export class PostLikes {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  addedAt: Date;
  @Column()
  status: LikeStatus;

  @ManyToOne(() => Posts, p => p.likes)
  @JoinColumn()
  post: Posts;

  @ManyToOne(() => Users, u => u.post_likes)
  @JoinColumn()
  user: Users
  @Column()
  login: string;
}
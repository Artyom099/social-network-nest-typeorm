import {Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from 'typeorm';
import {LikeStatus} from '../../../infrastructure/utils/constants';
import {Comments} from './сomment.entity';
import {Users} from '../../users/entity/user.entity';

@Entity()
export class CommentLikes {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  status: LikeStatus;

  @ManyToOne(() => Comments, c => c.likes)
  @JoinColumn()
  comment: Comments;

  @ManyToOne(() => Users, u => u.comment_likes)
  @JoinColumn()
  user: Users;
}
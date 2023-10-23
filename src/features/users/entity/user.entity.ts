import {Column, Entity, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn} from 'typeorm';
import {BannedUsersForBlog} from './banned.user.for.blog.entity';
import {Devices} from '../../devices/entity/device.entity';
import {Blogs} from '../../blogs/entity/blog.entity';
import {CommentLikes} from '../../comments/entity/comment.likes.entity';
import {PostLikes} from '../../posts/entity/post.likes.entity';
import {Comments} from '../../comments/entity/сomment.entity';
import {Player} from '../../quiz/entity/player.entity';
import {GamePair} from '../../quiz/entity/game.pair.entity';

@Entity()
export class Users {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  login: string;
  @Column()
  email: string;
  @Column()
  passwordSalt: string;
  @Column()
  passwordHash: string;
  @Column()
  createdAt: Date;
  @Column()
  isBanned: boolean;
  @Column({ nullable: true })
  banDate: Date;
  @Column({ nullable: true })
  banReason: string;
  @Column()
  confirmationCode: string;
  @Column({ nullable: true })
  expirationDate: Date;
  @Column()
  isConfirmed: boolean;
  @Column({ nullable: true })
  recoveryCode: string;

  @OneToMany(() => BannedUsersForBlog, bu => bu.user)
  bannedUsersForBlog: BannedUsersForBlog[];

  @OneToMany(() => Devices, d => d.userId)
  devices: Devices[];

  @OneToMany(() => Blogs, b => b.user)
  blogs: Blogs[];

  @OneToMany(() => PostLikes, p => p.user)
  post_likes: PostLikes[];

  @OneToMany(() => Comments, c => c.user)
  comments: Comments[];

  @OneToMany(() => CommentLikes, cl => cl.user)
  comment_likes: CommentLikes[];

  @OneToMany(() => Player, p => p.user)
  players: Player[];
}
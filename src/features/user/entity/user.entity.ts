import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BannedUsersForBlog } from './banned.user.for.blog.entity';
import { Devices } from '../../device/entity/device.entity';
import { Blogs } from '../../blog/entity/blog.entity';
import { CommentLikes } from '../../comment/entity/comment.likes.entity';
import { PostLikes } from '../../post/entity/post.likes.entity';
import { Comments } from '../../comment/entity/сomment.entity';
import { Player } from '../../quiz/entity/player.entity';

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

  @OneToMany(() => BannedUsersForBlog, (bu) => bu.user)
  bannedUsersForBlog: BannedUsersForBlog[];

  @OneToMany(() => Devices, (d) => d.userId)
  devices: Devices[];

  @OneToMany(() => Blogs, (b) => b.user)
  blogs: Blogs[];

  @OneToMany(() => PostLikes, (p) => p.user)
  post_likes: PostLikes[];

  @OneToMany(() => Comments, (c) => c.user)
  comments: Comments[];

  @OneToMany(() => CommentLikes, (cl) => cl.user)
  comment_likes: CommentLikes[];

  @OneToMany(() => Player, (p) => p.user)
  players: Player[];
}

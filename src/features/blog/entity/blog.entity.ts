import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Posts } from '../../post/entity/post.entity';
import { Users } from '../../user/entity/user.entity';
import { BannedUsersForBlog } from '../../user/entity/banned.user.for.blog.entity';
import { Comments } from '../../comment/entity/сomment.entity';

@Entity()
export class Blogs {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  name: string;
  @Column()
  description: string;
  @Column()
  websiteUrl: string;
  @Column()
  createdAt: Date;
  @Column()
  isMembership: boolean;
  @Column()
  isBanned: boolean;
  @Column({ nullable: true })
  banDate: Date;

  @ManyToOne(() => Users, (u) => u.blogs)
  user: Users;
  @Column({ nullable: true })
  userLogin: string;

  @OneToMany(() => Posts, (p) => p.blog)
  posts: Posts[];

  @OneToMany(() => Comments, (c) => c.blog)
  comments: Comments[];

  @OneToMany(() => BannedUsersForBlog, (bu) => bu.blog)
  bannedUsersForBlog: BannedUsersForBlog[];
}

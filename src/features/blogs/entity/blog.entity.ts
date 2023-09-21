import {Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn} from 'typeorm';
import {Posts} from '../../posts/entity/post.entity';
import {Users} from '../../users/entity/user.entity';
import {BannedUsersForBlog} from '../../users/entity/banned.user.for.blog.entity';
import {Comments} from '../../comments/entity/сomment.entity';

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

  @ManyToOne(() => Users, u => u.blogs)
  user: Users;
  @Column({ nullable: true })
  userLogin: string;

  @OneToMany(() => Posts, p => p.blog)
  posts: Posts[];

  @OneToMany(() => Comments, c => c.blog)
  comments: Comments[];

  @OneToMany(() => BannedUsersForBlog, bu => bu.blog)
  bannedUsersForBlog: BannedUsersForBlog[];
}
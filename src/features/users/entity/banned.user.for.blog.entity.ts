import {Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn} from 'typeorm';
import {Users} from './user.entity';
import {Blogs} from '../../blogs/entity/blog.entity';

@Entity()
export class BannedUsersForBlog {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  isBanned: boolean;
  @Column()
  banDate: Date;
  @Column()
  banReason: string;

  @ManyToOne(() => Users, u => u.bannedUsersForBlog)
  @JoinColumn()
  user: Users;
  // @Column({nullable: true})
  // userId: string;
  @Column()
  login: string;
  @Column()
  createdAt: string;

  @OneToOne(() => Blogs, b => b.bannedUsersForBlog)
  @JoinColumn()
  blog: Blogs;
  @Column({nullable: true})
  blogId: string;
}
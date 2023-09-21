import {Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn} from 'typeorm';
import {CommentLikes} from './comment.likes.entity';
import {Posts} from '../../posts/entity/post.entity';
import {Users} from '../../users/entity/user.entity';
import {Blogs} from '../../blogs/entity/blog.entity';

@Entity()
export class Comments {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  content: string;
  @Column()
  createdAt: Date;

  @ManyToOne(() => Users, u => u.comments)
  @JoinColumn()
  user: Users;
  @Column()
  userLogin: string;

  @ManyToOne(() => Blogs, b => b.comments)
  @JoinColumn()
  blog: Blogs;
  @Column()
  blogName: string;

  @ManyToOne(() => Posts, p => p.comments)
  @JoinColumn()
  post: Posts;
  @Column()
  postTitle: string;

  @OneToMany(() => CommentLikes, l => l.comment)
  likes: CommentLikes[];
}
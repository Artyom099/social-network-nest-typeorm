import {Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn} from 'typeorm';
import {Blogs} from '../../blogs/entity/blog.entity';
import {Comments} from '../../comments/entity/сomment.entity';
import {PostLikes} from './post.likes.entity';

@Entity()
export class Posts {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  title: string;
  @Column()
  shortDescription: string;
  @Column()
  content: string;
  @Column()
  createdAt: Date;

  @ManyToOne(() => Blogs, b => b.posts)
  @JoinColumn()
  blog: Blogs;
  @Column()
  blogName: string;

  @OneToMany(() => Comments, c => c.post)
  comments: Comments[];

  @OneToMany(() => PostLikes, l => l.post)
  likes: PostLikes[];
}
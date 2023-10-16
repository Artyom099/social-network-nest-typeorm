import {Column, Entity, PrimaryGeneratedColumn} from 'typeorm';

@Entity()
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  body: string;
  @Column()
  correctAnswers: string[];
  @Column()
  published: boolean;
  @Column()
  createdAt: Date;
  @Column()
  updatedAt: Date;
}
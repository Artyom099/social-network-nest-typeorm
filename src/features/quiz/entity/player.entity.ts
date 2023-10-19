import {Entity, PrimaryGeneratedColumn} from 'typeorm';

@Entity()
export class Answer {
  @PrimaryGeneratedColumn('uuid')
  id: string;
}
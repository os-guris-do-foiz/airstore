import { Entity, PrimaryColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, BeforeInsert } from "typeorm";
import { User } from "./user";

@Entity('comments')
export class Comment {
  @PrimaryColumn('varchar', { length: 15 }) id: string;
  
  @ManyToOne(() => User, { onDelete: 'CASCADE' }) 
  @JoinColumn({ name: 'profile_user_id' }) 
  profile_user: User;
  
  @ManyToOne(() => User, { onDelete: 'CASCADE' }) 
  @JoinColumn({ name: 'author_user_id' }) 
  author_user: User;
  
  @Column('text') content: string;
  
  @CreateDateColumn() created_at: Date;

  @BeforeInsert() setId() { this.id = Math.random().toString(36).substring(2, 13); }
}
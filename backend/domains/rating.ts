import { Entity, PrimaryColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Unique, Check, BeforeInsert } from "typeorm";
import { randomId } from "../utils/id";
import { User } from "./user";

@Entity('ratings')
@Unique(['profile_user', 'author_user'])
@Check(`"score" >= 1 AND "score" <= 5`)
export class Rating {
  @PrimaryColumn('varchar', { length: 15 }) id: string;
  
  @ManyToOne(() => User, { onDelete: 'CASCADE' }) 
  @JoinColumn({ name: 'profile_user_id' }) 
  profile_user: User;
  
  @ManyToOne(() => User, { onDelete: 'CASCADE' }) 
  @JoinColumn({ name: 'author_user_id' }) 
  author_user: User;
  
  @Column('int') score: number;
  
  @CreateDateColumn() created_at: Date;

  @BeforeInsert() setId() { this.id = randomId(); }
}
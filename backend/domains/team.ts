import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, BeforeInsert } from "typeorm";
import { randomId } from "../utils/id";
import { User } from "./user";

@Entity('teams')
export class Team {
  @PrimaryColumn('varchar', { length: 15 }) id: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'creator_id' })
  creator: User | null;

  @Column('varchar') name: string;
  @Column('text', { nullable: true }) description: string | null;
  @Column('varchar', { nullable: true }) avatar: string | null;
  @Column('varchar', { nullable: true }) banner: string | null;

  @Column('varchar', { default: 'PUBLIC' }) visibility: string;

  @Column('text', { nullable: true }) notice: string | null;

  @Column('varchar', { nullable: true }) invite_token: string | null;

  @Column('varchar', { nullable: true }) ad_title: string | null;
  @Column('text', { nullable: true }) ad_description: string | null;
  @Column('varchar', { nullable: true }) ad_image: string | null;
  @Column('timestamp', { nullable: true }) ad_created_at: Date | null;

  @CreateDateColumn() created_at: Date;
  @UpdateDateColumn() updated_at: Date;

  @BeforeInsert() setId() { this.id = randomId(); }
}

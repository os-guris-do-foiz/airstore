import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, BeforeInsert } from "typeorm";
import { randomId } from "../utils/id";
import { User } from "./user";
import { Field } from "./field";

@Entity('field_events')
export class Event {
  @PrimaryColumn('varchar', { length: 15 }) id: string;

  @ManyToOne(() => Field, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'field_id' })
  field: Field;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'creator_id' })
  creator: User;

  @Column('varchar', { nullable: true }) title: string | null;

  @Column('date') date: string;
  @Column('varchar') start_time: string;
  @Column('varchar', { nullable: true }) end_time: string | null;

  @Column('varchar', { default: 'PUBLIC' }) visibility: string;

  @Column('int', { default: 30 }) max_players: number;

  @Column('varchar', { default: 'PENDING' }) status: string;

  @Column('varchar', { nullable: true }) invite_token: string | null;

  @CreateDateColumn() created_at: Date;
  @UpdateDateColumn() updated_at: Date;

  @BeforeInsert() setId() { this.id = randomId(); }
}

import { Entity, PrimaryColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, BeforeInsert } from "typeorm";
import { randomId } from "../utils/id";
import { User } from "./user";
import { Event } from "./event";

@Entity('event_participants')
export class EventParticipant {
  @PrimaryColumn('varchar', { length: 15 }) id: string;

  @ManyToOne(() => Event, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @ManyToOne(() => User, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User | null;

  @Column('varchar') name: string;

  @Column('boolean', { default: false }) needs_rental: boolean;

  @CreateDateColumn() created_at: Date;

  @BeforeInsert() setId() { this.id = randomId(); }
}

import { Entity, PrimaryColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, BeforeInsert } from "typeorm";
import { randomId } from "../utils/id";
import { User } from "./user";

@Entity('notifications')
export class Notification {
  @PrimaryColumn('varchar', { length: 15 }) id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recipient_id' })
  recipient: User;

  @Column('varchar', { default: 'GENERIC' }) type: string;

  @Column('varchar') message: string;

  @Column('varchar', { nullable: true }) link: string | null;

  @Column('boolean', { default: false }) is_read: boolean;

  @CreateDateColumn() created_at: Date;

  @BeforeInsert() setId() { this.id = randomId(); }
}

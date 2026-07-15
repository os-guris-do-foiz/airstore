import { Entity, PrimaryColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index, BeforeInsert } from "typeorm";
import { randomId } from "../utils/id";
import { User } from "./user";

@Entity('donations')
export class Donation {
  @PrimaryColumn('varchar', { length: 15 }) id: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User | null;

  @Column('varchar', { nullable: true }) donor_name: string | null;

  @Column('decimal', { precision: 10, scale: 2 }) amount: number;

  @Column('varchar') method: string;

  @Index({ unique: true, where: '"external_id" IS NOT NULL' })
  @Column('varchar', { nullable: true }) external_id: string | null;

  @Column('varchar', { default: 'APPROVED' }) status: string;

  @CreateDateColumn() created_at: Date;

  @BeforeInsert() setId() { this.id = randomId(); }
}

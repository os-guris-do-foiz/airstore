import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, BeforeInsert } from "typeorm";
import { randomId } from "../utils/id";
import { User } from "./user";

@Entity('reports')
export class Report {
  @PrimaryColumn('varchar', { length: 15 })
  id: string;


  @ManyToOne(() => User)
  @JoinColumn({ name: 'reporter_id' })
  reporter: User;

  @Column('varchar')
  target_id: string;

  @Column({ type: 'varchar', length: 50 })
  type: string; 

  @Column({ type: 'varchar', length: 255 })
  reason: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column("text", { array: true, default: [] })
  images: string[];

  @Column({ type: 'varchar', length: 50, default: 'PENDING' })
  status: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @BeforeInsert() setId() { this.id = randomId(); }
}
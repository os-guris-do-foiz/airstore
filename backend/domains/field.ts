import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable, BeforeInsert } from "typeorm";
import { randomId } from "../utils/id";
import { User } from "./user";

@Entity('fields')
export class Field {
  @PrimaryColumn('varchar', { length: 15 }) id: string;

  @ManyToMany(() => User)
  @JoinTable({ name: 'field_owners' })
  owners: User[];

  @Column('varchar') name: string;
  @Column('text') description: string;
  @Column('varchar') location: string;
  @Column('varchar', { nullable: true }) type: string | null;

  @Column('decimal', { precision: 10, scale: 2, default: 0 }) base_price: number;
  @Column('decimal', { precision: 10, scale: 2, default: 0 }) rental_price: number;

  @Column('varchar', { nullable: true }) whatsapp: string | null;

  @Column('varchar', { nullable: true }) cover: string | null;

  @Column("text", { array: true, default: [] }) images: string[];
  @Column("text", { array: true, default: [] }) rules: string[];
  @Column("text", { array: true, default: [] }) infrastructure: string[];

  @CreateDateColumn() created_at: Date;
  @UpdateDateColumn() updated_at: Date;

  @BeforeInsert() setId() { this.id = randomId(); }
}

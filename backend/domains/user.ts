import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, BeforeInsert } from "typeorm";

@Entity('users')
export class User {
  @PrimaryColumn('varchar', { length: 15 }) id: string;
  @Column('varchar') name: string;
  @Column('varchar', { unique: true }) email: string;
  @Column('varchar') password_hash: string;
  @Column('varchar', { nullable: true }) city: string;
  @Column('varchar', { nullable: true }) avatar: string;
  
  @Column('boolean', { default: false }) is_donor: boolean;
  @Column('timestamp', { nullable: true }) donor_expiry: Date;
  @Column('float', { default: 5.0 }) rating: number;
  @Column('int', { default: 0 }) reviews_count: number;
  

  @Column("text", { array: true, default: ["USER"] }) roles: string[];
  @Column('varchar', { default: 'ACTIVE' }) status: string;

  @CreateDateColumn() created_at: Date;
  @UpdateDateColumn() updated_at: Date;

  @BeforeInsert() setId() { this.id = Math.random().toString(36).substring(2, 13); }
}
import { Entity, PrimaryColumn, Column, CreateDateColumn, BeforeInsert, Index } from "typeorm";
import { randomId } from "../utils/id";

@Entity('verification_codes')
export class VerificationCode {
  @PrimaryColumn('varchar', { length: 15 }) id: string;

  @Index()
  @Column('varchar') email: string;

  @Column('varchar') code_hash: string;

  @Column('varchar') purpose: string;

  @Column('timestamp') expires_at: Date;

  @Column('int', { default: 0 }) attempts: number;

  @Column('boolean', { default: false }) used: boolean;

  @CreateDateColumn() created_at: Date;

  @BeforeInsert() setId() { this.id = randomId(); }
}

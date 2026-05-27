import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, BeforeInsert } from "typeorm";
import { User } from "./user";

@Entity('ads')
export class Ad {
  @PrimaryColumn('varchar', { length: 15 }) id: string;
  
  @ManyToOne(() => User, { onDelete: 'CASCADE' }) 
  @JoinColumn({ name: 'user_id' }) 
  user: User;
  
  @Column('varchar') title: string;
  @Column('text') description: string;
  @Column('decimal', { precision: 10, scale: 2 }) price: number;
  @Column('varchar') location: string;
  

  @Column('varchar', { nullable: true }) category: string | null;
  @Column('varchar', { nullable: true }) whatsapp: string | null;
  @Column("text", { array: true, default: [] }) tags: string[];
  @Column("text", { array: true, default: [] }) images: string[];
  
  @Column('varchar', { nullable: true }) model: string | null;
  @Column('varchar', { nullable: true }) brand: string | null;
  @Column('varchar', { nullable: true }) fps: string | null;
  @Column('varchar', { nullable: true }) type: string | null;
  @Column('varchar', { nullable: true }) condition: string | null;
  
  @Column('boolean', { default: false }) accepts_trade: boolean;
  @Column('boolean', { default: false }) is_sold: boolean;
  
  @CreateDateColumn() created_at: Date;
  @UpdateDateColumn() updated_at: Date;

  @BeforeInsert() setId() { this.id = Math.random().toString(36).substring(2, 13); }
}
import { Entity, PrimaryColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Unique, BeforeInsert } from "typeorm";
import { randomId } from "../utils/id";
import { User } from "./user";
import { Team } from "./team";

@Entity('team_members')
@Unique(['team', 'user'])
export class TeamMember {
  @PrimaryColumn('varchar', { length: 15 }) id: string;

  @ManyToOne(() => Team, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'team_id' })
  team: Team;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column('varchar', { default: 'MEMBER' }) role: string;

  @Column('varchar', { default: 'ACTIVE' }) status: string;

  @CreateDateColumn() created_at: Date;

  @BeforeInsert() setId() { this.id = randomId(); }
}

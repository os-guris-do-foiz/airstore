import { Entity, PrimaryColumn, ManyToOne, JoinColumn, CreateDateColumn, Unique, BeforeInsert } from "typeorm";
import { randomId } from "../utils/id";
import { User } from "./user";
import { Ad } from "./ad";

@Entity("favorites")
@Unique(["user", "ad"])
export class Favorite {
  @PrimaryColumn("varchar", { length: 15 }) id: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User;

  @ManyToOne(() => Ad, { onDelete: "CASCADE" })
  @JoinColumn({ name: "ad_id" })
  ad: Ad;

  @CreateDateColumn() created_at: Date;

  @BeforeInsert() setId() { this.id = randomId(); }
}

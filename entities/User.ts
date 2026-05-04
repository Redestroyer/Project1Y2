import { Entity, Column } from "typeorm"
import { BaseEntity } from "./shared";

@Entity()
export default class User extends BaseEntity {
    @Column("varchar", { length: 128 }) name!: string;
    @Column("text") bio!: string;
}

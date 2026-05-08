import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity() export default class Post {
    @PrimaryGeneratedColumn("increment") id: number;
    @Column("text") title: string;
    @Column("text") content: string;
}

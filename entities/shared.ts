import { PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, type EntityOptions } from "typeorm";

export abstract class BaseEntity {
    @PrimaryGeneratedColumn("increment") id?: number;
    @CreateDateColumn() created_at?: Date;
    @UpdateDateColumn() updated_at?: Date;

    exists(): this is RegisteredEntity {
        return this.id !== undefined;
    }
}
export type RegisteredEntity = {
    id: string;
    created_at: Date;
    updated_at: Date;
}
export type BareEntity<T> = {
    [K in keyof T as Exclude<K, "exists">]: T[K]
}

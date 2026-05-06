import type { FastifySchema } from "fastify";
import type { Repository, ObjectLiteral } from "typeorm";
import type { TypedReply, TypedRequest } from "..";

export type Action<T extends FastifySchema, R = any> = (request: TypedRequest<T>, response: TypedReply<T>) => Promise<R>;
export class Controller<T extends ObjectLiteral> {
    readonly repository: Repository<T>;
    constructor(repository: Repository<T>) {
        this.repository = repository;
    }
}

import { Inject, Injectable } from "@nestjs/common";
import { Repository as $Repository, FindOneOptions, FindOptionsWhere } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Post } from "../database/entities";

export class DTO {
    title: string;
    content: string;
}

@Injectable() export default class Repository {
    static DTO = DTO;
    constructor(
        @InjectRepository(Post) readonly repository: $Repository<Post>
    ) {}

    getAll(...options: FindOptionsWhere<Post>[]) {
        return options.length != 0 ? this.repository.findBy(options) : this.repository.find();
    }
    getOne(...options: FindOptionsWhere<Post>[]): Promise<Post | null> {
        return this.repository.findOneBy(options);
    }
    async create(body: Partial<DTO>) {
        const entity = this.repository.create(body);
        const result = await this.repository.insert(body);
        return { entity, result };
    }
}

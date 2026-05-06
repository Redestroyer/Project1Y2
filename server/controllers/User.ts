import type { Repository } from "typeorm";
import { User as Entity } from "../../entities";
import { User as Schemas } from "../../schemas";
import type { FastifyReply, FastifyRequest } from "fastify";
import { ContentType } from "../plugins/ContentTypeSelector";
import type { TypedReply, TypedRequest } from "..";
import { Controller } from "./shared";

export default class User extends Controller<Entity> {
    async index(request: TypedRequest<typeof Schemas.GetAll>, response: TypedReply<typeof Schemas.GetAll>) {
        const users = await this.repository.find();
        switch (request.acceptType([ContentType.ApplicationJSON, ContentType.TextHTML])) {
            case ContentType.ApplicationJSON:
                return response.sendJSON(users);
        
            default:
                return response.viewAsync("users/index", { users, url: request.url });
        }
    }
    async get(request: TypedRequest<typeof Schemas.GetOne>, response: TypedReply<typeof Schemas.GetOne>) {
        const user = await this.repository.findOneBy(request.params);
        if (user === null) response.status(404);
        switch (request.acceptType([ContentType.ApplicationJSON, ContentType.TextHTML])) {
            case ContentType.ApplicationJSON:
                return response.sendJSON(user);
        
            default:
                return response.viewAsync("users/get", { user, url: request.url });
        }
    }
}

import { DataSource, DeleteResult, InsertResult, ObjectId, Repository, UpdateResult, type DeepPartial, type FindOptionsWhere, type ObjectLiteral } from "typeorm";
import Fastify from "fastify";
import { Parameters, type TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import type {
    ContextConfigDefault,
    FastifyReply,
    FastifyRequest,
    RawReplyDefaultExpression,
    RawRequestDefaultExpression,
    RawServerDefault,
} from 'fastify';
import type { RouteGenericInterface } from 'fastify/types/route';
import type { FastifySchema } from 'fastify/types/schema';
import { User as UserEntity } from "../entities";
import { User as UserSchemas } from "../schemas";
//import { User as UserController } from "./controllers";
import FastifyView from "@fastify/view";
import Pug from "pug";
import FastifyFormbody from "@fastify/formbody";
import ContentTypeSelector, { ContentType } from "./plugins/ContentTypeSelector";
import SendType from "./plugins/SendType";

declare module "fastify" {
    interface FastifyInstance {
        get datasource(): DataSource
    }
}

export type TypedRequest<TSchema extends FastifySchema> = FastifyRequest<
    RouteGenericInterface,
    RawServerDefault,
    RawRequestDefaultExpression,
    TSchema,
    TypeBoxTypeProvider
>;
export type TypedReply<TSchema extends FastifySchema> = FastifyReply<
    RouteGenericInterface,
    RawServerDefault,
    RawRequestDefaultExpression,
    RawReplyDefaultExpression,
    ContextConfigDefault,
    TSchema,
    TypeBoxTypeProvider
>;
export type DatabaseQueryCriteria<Entity extends ObjectLiteral> = string | string[] | number | number[] | Date | Date[] | ObjectId | ObjectId[] | FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[]

export default async function Server(datasource: DataSource) {
    const App = Fastify({
        logger: true
    }).withTypeProvider<TypeBoxTypeProvider>();

    App.register(FastifyFormbody);
    App.register(FastifyView, {
        engine: { pug: Pug },
        root: "./server/views/",
        includeViewExtension: true
    });
    
    App.register(SendType);
    App.register(ContentTypeSelector);

    App.register(async function(app, options: { repository: Repository<UserEntity> }) {
        const { repository } = options;
        //const controller = new UserController(repository);

        async function create(data: DeepPartial<UserEntity>): Promise<{ entity: UserEntity; result: InsertResult; }> {
            const entity = repository.create(data);
            const result = await repository.insert(entity);
            return { entity, result };
        }
        async function overwrite(id: NonNullable<UserEntity["id"]>, data: DeepPartial<UserEntity>): Promise<undefined | { entity: UserEntity; result: UpdateResult }> {
            if (!await repository.existsBy({ id })) return undefined;
            const entity = repository.create(data);
            const result = await repository.update(id, entity);
            return { entity, result };
        }
        async function patch(id: NonNullable<UserEntity["id"]>, data: DeepPartial<UserEntity>): Promise<undefined | { entity: UserEntity; result: UpdateResult }> {
            const origEntity = await repository.findOneBy({ id });
            if (!origEntity) return undefined;
            const entity = repository.merge(origEntity, data);
            const result = await repository.update(id, entity);
            return { entity, result };
        }
        async function destroy(id: NonNullable<UserEntity["id"]>): Promise<undefined | DeleteResult> {
            if (!await repository.existsBy({ id })) return undefined;
            return await repository.delete(id);
        }

        app.get("/", async function(request: TypedRequest<typeof UserSchemas.GetAll>, response) {
            const users = await repository.find();
            switch (request.acceptType([ContentType.ApplicationJSON, ContentType.TextHTML])) {
                case ContentType.ApplicationJSON:
                    return response.sendJSON(users);
            
                default:
                    return response.viewAsync("users/index", { users, url: request.url });
            }
        });
        app.get("/:id", async function(request: TypedRequest<typeof UserSchemas.GetOne>, response) {
            const user = await repository.findOneBy(request.params);
            if (user === null) response.status(404);
            switch (request.acceptType([ContentType.ApplicationJSON, ContentType.TextHTML])) {
                case ContentType.ApplicationJSON:
                    return response.sendJSON(user);
            
                default:
                    return response.viewAsync("users/get", { user, url: request.url });
            }
        });
        app.get("/new", async function(request, response) {
            return response.viewAsync("users/new");
        });
        app.post("/", async function(request: TypedRequest<typeof UserSchemas.Create>, response) {
            const { entity: user } = await create(request.body);
            return response.redirect(`${request.url}/${user.id}`, 303);
        });
        app.get("/:id/edit", async function(request: TypedRequest<typeof UserSchemas.GetOne>, response) {
            const user = await repository.findOneBy(request.params);
            if (user === null) response.status(404).send();
            return response.viewAsync("users/edit", { user });
        });
        app.post("/:id/edit", async function(request: TypedRequest<typeof UserSchemas.Overwrite>, response) {
            if (!await repository.existsBy(request.params)) return response.status(404).send();
            const user = repository.create(request.body);
            await repository.update(request.params.id, user);
            return response.redirect(`${request.url.replace(/\/edit$/, "")}`, 303);
        });
        app.put("/:id", async function(request: TypedRequest<typeof UserSchemas.Overwrite>, response) {
            const result = await overwrite(request.params.id, request.body);
            if (!result) return response.status(404).send();
            return response.redirect(`${request.url}`, 303);
        });
        app.patch("/:id", async function(request: TypedRequest<typeof UserSchemas.Patch>, response) {
            const result = await patch(request.params.id, request.body);
            if (!result) return response.status(404).send();
            return response.redirect(`${request.url}`, 303);
        });
        app.post("/:id/delete", async function(request: TypedRequest<typeof UserSchemas.Delete>, response) {
            if (!await repository.existsBy(request.params)) return response.status(404).send();
            await repository.delete(request.params.id);
            return response.redirect(request.url.replace(/\d*\/delete/, ""), 303);
        });
        app.delete("/:id", async function(request: TypedRequest<typeof UserSchemas.Delete>, response) {
            if (!await repository.existsBy(request.params)) return response.status(404).send();
            await repository.delete(request.params.id);
            return response.status(204).send();
        });
    }, { prefix: "/users", repository: datasource.getRepository(UserEntity) });
    App.get("/", async function(request, response) {
        switch (request.acceptType([ContentType.ApplicationJSON, ContentType.TextHTML])) {
            case ContentType.ApplicationJSON:
                return response.header("content-type", ContentType.ApplicationJSON).send({ where: "Index."});
        
            default:
                return response.viewAsync("index");
        }
    });
    App.post("/echo", async function(request, response) {
        return response.send(request.body);
    });

    return App;
}
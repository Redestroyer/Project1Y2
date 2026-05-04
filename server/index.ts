import { DataSource, Repository } from "typeorm";
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
import { User } from "../entities";
import { User as UserSchemas } from "../schemas";
import FastifyView from "@fastify/view";
import Pug from "pug";
import FastifyFormbody from "@fastify/formbody";
import ContentTypeSelector, { ContentType } from "./plugins/ContentTypeSelector";

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
    
    App.decorate("datasource", datasource);
    App.register(ContentTypeSelector);

    App.register(async function(app, options: { prefix: string, repository: Repository<User> }) {
        const { prefix, repository } = options;
        app.get("/", async function(request: TypedRequest<typeof UserSchemas.GetAll>, response) {
            const users = await repository.find();
            switch (request.acceptType([ContentType.ApplicationJSON, ContentType.TextHTML])) {
                case ContentType.ApplicationJSON:
                    return response.header("content-type", ContentType.ApplicationJSON).send(users);
            
                default:
                    return response.viewAsync("users/index", { users });
            }
        });
        app.get("/:id", async function(request: TypedRequest<typeof UserSchemas.GetOne>, response) {
            const user = await repository.findOneBy(request.params);
            if (user === null) return response.status(404);
            switch (request.acceptType([ContentType.ApplicationJSON, ContentType.TextHTML])) {
                case ContentType.ApplicationJSON:
                    return response.type(ContentType.ApplicationJSON).send(user);
            
                default:
                    return response.viewAsync("users/get", { user });
            }
        });
        app.get("/new", async function(request, response) {
            return response.viewAsync("users/new");
        });
        app.post("/", async function(request: TypedRequest<typeof UserSchemas.Create>, response) {
            const user = repository.create(request.body);
            await repository.insert(user);
            switch (request.acceptType([ContentType.ApplicationJSON, ContentType.TextHTML])) {
                case ContentType.ApplicationJSON:
                    return response.status(201).type(ContentType.ApplicationJSON).send(user);
            
                default:
                    return response.redirect(`${request.originalUrl}${prefix}/${user.id}`, 303);
            }
        });
        app.put("/:id", async function(request: TypedRequest<typeof UserSchemas.Overwrite>, response) {
            if (!await repository.existsBy(request.params)) return response.status(404);
            const user = repository.create(request.body);
            await repository.update(request.params.id, user);
            return response.status(201).send(user);
        });
        app.patch("/:id", async function(request: TypedRequest<typeof UserSchemas.Patch>, response) {
            const origUser = await repository.findOneBy(request.params);
            if (origUser === null) return response.status(404);
            const user = repository.merge(origUser, request.body);
            await repository.update(request.params.id, user);
            return response.status(201).send(user);
        });
        app.delete("/:id", async function(request: TypedRequest<typeof UserSchemas.Delete>, response) {
            const user = await repository.findOneBy(request.params);
            if (user === null) return response.status(404);
            await repository.delete(user.id!);
            return response.status(201);
        })
    }, { prefix: "/users", repository: datasource.getRepository(User) });
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
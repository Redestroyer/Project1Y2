import type { FastifyInstance } from "fastify";
import FastifyPlugin from "fastify-plugin";
import { ContentType } from "./ContentTypeSelector";

declare module "fastify" {
    interface FastifyReply {
        sendJSON(json: any): FastifyReply;
    }
}

const SendType = FastifyPlugin(async function(app: FastifyInstance) {
    app.decorateReply("sendJSON", function(json: any) {
        return this.type(ContentType.ApplicationJSON).send(json);
    })
});

export default SendType

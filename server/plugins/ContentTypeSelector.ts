import type { FastifyInstance, FastifyRequest } from "fastify";
import FastifyPlugin from "fastify-plugin";

declare module "fastify" {
    interface FastifyRequest {
        /**
         * Returns the accepted content types.
         */
        get acceptedTypes(): ContentType[];
        /**
         * Returns the first matching accepting content type.
         * @param types The types to check.
         */
        acceptType(types: ContentType[]): ContentType | null;
        /**
         * Check whether the given type is accepted.
         * @param type The type to check.
         */
        acceptType(type: ContentType): boolean;
    }
}

export enum ContentType {
    Any = "*/*",
    ApplicationAny = "application/*",
    ApplicationJSON = "application/json",
    TextAny = "text/*",
    TextHTML = "text/html",
}
export const ContentTypeCodes: string[] = Object.values(ContentType);
export function IsContentTypeCode(code: string | ContentType): code is ContentType {
    return ContentTypeCodes.includes(code);
}

export function ContentTypePrecedence(type: ContentType): 0 | 1 | 2 {
    const subany = [ContentType.ApplicationAny, ContentType.TextAny];
    return type === ContentType.Any ? 2 : subany.includes(type) ? 1 : 0;
}
export function ContentTypeCodesToEnum(types: string): ContentType[] {
    // For now, we ignore weights.
    const split = types.split(/\s*,\s*/).map(v => <string>v.split(/\s*;\s*/)[0]);
    const list = split.filter(IsContentTypeCode);
    list.sort((a, b) => ContentTypePrecedence(a) - ContentTypePrecedence(b));
    return list;
}

async function ContentTypeSelector(app: FastifyInstance) {
    app.decorateRequest("acceptedTypes", {
        getter() {
            const accept = this.headers.accept;
            return accept ? ContentTypeCodesToEnum(accept) : []
        }
    });
    function acceptType(this: FastifyRequest, types: ContentType[]): ContentType | null;
    function acceptType(this: FastifyRequest, type: ContentType): boolean;
    function acceptType(this: FastifyRequest, types: ContentType | ContentType[]): boolean | ContentType | null {
        const accept = this.acceptedTypes;
        if (typeof types === "string") return accept.includes(types);
        if (accept.length == 0) return null;
        return accept.find(v => types.includes(v)) || null;
    };
    app.decorateRequest("acceptType", acceptType!);
};
export default FastifyPlugin(ContentTypeSelector);
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
export function IsContentTypeCode(code: string): code is ContentType {
    return ContentTypeCodes.includes(code);
}
export function ContentTypeMatch(type: ContentType, match: ContentType | ContentType[]): boolean {
    if (typeof match === "object")
    {
        // match: ContentType[]
        for (const m of match) {
            if (ContentTypeMatch(type, m)) return true;
        }
        return false;
    }
    // match: ContentType
    // Type and subtype.
    const [t, st] = match.split("/");
    // The only type that matches this is the any type.
    if (t == "*") return true;
    // The `!` suffix is for no typecheck. We know all the MIME types have a slash in them, so both `t` and `st` are not undefined.
    // Sadly, I can't find a way to tell TypeScript that other than this.
    if (st == "*") return type.startsWith(t!);
    return type == match;
}
export function ContentTypePrecedence(type: ContentType): 0 | 1 | 2 {
    // While this will include "*/*", such case is already caught by the first check.
    const subany = ContentTypeCodes.filter(v => v.endsWith("*"));
    return type === ContentType.Any ? 2 : subany.includes(type) ? 1 : 0;
}
export function ContentTypeCodesToEnum(types: string): ContentType[] {
    // For now, we ignore weights. See https://httpwg.org/specs/rfc9110.html#conneg.features
    // By the way, this is RegEx. Sheenful, innit? :)
    const split = types.split(/\s*,\s*/).map(v => <string>v.split(/\s*;\s*/)[0]);
    // This is mostly temporary, as we currently only have a few content types. Once all are added, we might be able to ditch it.
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
        if (typeof types === "string") return ContentTypeMatch(types, accept);
        if (accept.length == 0) return null;
        return accept.find(v => types.map(t => ContentTypeMatch(t, v)).reduce((a, b) => a || b)) || null;
    };
    app.decorateRequest("acceptType", acceptType!);
};
export default FastifyPlugin(ContentTypeSelector);
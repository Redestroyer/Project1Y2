import Type from "typebox";

export const id = Type.Number({ minimum: 1 });
export const IDParam = Type.Object({ id });

export function Boilerplate<B extends Type.TSchema>(body: B, partialBody?: Type.TPartial<B>, notFound?: Type.TSchema, genericSuccess?: Type.TSchema) {
    partialBody = partialBody || Type.Partial(body);
    notFound = notFound || Type.String({ default: "Not found." });
    genericSuccess = genericSuccess || Type.String({ default: "Success." });
    return {
        GetAll: {
            response: {
                200: Type.Union([Type.Array(body), Type.String()])
            }
        },
        GetOne: {
            params: IDParam,
            response: {
                200: Type.Union([body, Type.String()]),
                404: notFound
            }
        },
        Create: {
            body: Type.Intersect([body, Type.Object({ $METHOD: Type.Union([Type.Literal("post"), Type.Literal("put"), Type.Literal("patch"), Type.Literal("delete")]) }, { default: { $METHOD: "post" } })]),
            response: {
                201: body,
                303: Type.Any(),
                404: notFound
            }
        },
        Overwrite: {
            params: IDParam,
            body,
            response: {
                201: body,
                303: Type.Any(),
                404: notFound
            }
        },
        Patch: {
            params: IDParam,
            body: partialBody,
            response: {
                201: body,
                303: Type.Any(),
                404: notFound
            }
        },
        Delete: {
            params: IDParam,
            response: {
                204: genericSuccess,
                303: Type.Any(),
                404: notFound
            }
        }
    }
}

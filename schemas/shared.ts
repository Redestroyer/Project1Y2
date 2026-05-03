import Type from "typebox";

export const id = Type.Number({ minimum: 1 });
export const IDParam = Type.Object({ id });

export function Boilerplate<B extends Type.TObject>(body: B, partialBody?: B | Type.TPartial<B>, notFound?: Type.TSchema) {
    partialBody = partialBody || Type.Partial(body);
    notFound = notFound || Type.String({ default: "Not found." });
    return {
        GetAll: {
            response: {
                200: Type.Array(body)
            }
        },
        GetOne: {
            params: IDParam,
            response: {
                200: body,
                404: notFound
            }
        },
        Create: {
            body,
            response: {
                201: body
            }
        },
        Overwrite: {
            params: IDParam,
            body,
            response: {
                201: body,
                404: notFound
            }
        },
        Patch: {
            params: IDParam,
            body: partialBody,
            response: {
                201: body,
                404: notFound
            }
        },
        Delete: {
            params: IDParam,
            response: {
                201: Type.Object({}),
                404: notFound
            }
        }
    }
}

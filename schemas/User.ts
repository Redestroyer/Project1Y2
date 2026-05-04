import Type from "typebox";
import { Boilerplate } from "./shared";

export const Body = Type.Object({
    name: Type.String({ minLength: 4, maxLength: 128 }),
    bio: Type.String()
});
export const { GetAll, GetOne, Create, Overwrite, Patch, Delete } = Boilerplate(Body);

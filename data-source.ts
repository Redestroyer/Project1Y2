import "reflect-metadata";
import { DataSource } from "typeorm";
import * as Entities from "./entities";

const AppDataSource = new DataSource({
    type: "sqlite",
    database: "database.sqlite",
    synchronize: true,
    logging: true,
    entities: Object.values(Entities),
    migrations: [],
    subscribers: [],
});
export default AppDataSource;

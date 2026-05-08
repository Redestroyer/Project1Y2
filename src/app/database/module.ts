import { Module as $Module, Global } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import Entities from "./entities";
import Migrations from "./migrations";
import Subscribers from "./subscribers";

@Global()
@$Module({
    imports: [TypeOrmModule.forRoot({
        type: "better-sqlite3",
        database: "DATABASE",
        synchronize: process.env.NODE_ENV != "production",
        logging: true,
        entities: Object.values(Entities),
        migrations: Object.values(Migrations),
        subscribers: Object.values(Subscribers)
    })]
}) export default class Module {}
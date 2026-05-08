import { Module as $Module } from "@nestjs/common";
import Controller from "./controller";

@$Module({
    controllers: [Controller]
}) export default class Module {}
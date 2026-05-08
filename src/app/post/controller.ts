import { Controller as $Controller, Get, Post } from "@nestjs/common";

@$Controller("posts") export default class Controller {
    @Get() index() {
        return "No posts yet.";
    }
}

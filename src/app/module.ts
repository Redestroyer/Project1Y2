import { Module as $Module } from '@nestjs/common';
import Controller from './controller';
import Service from './service';
import Database from './database';
import Post from './post';

@$Module({
  imports: [Database.Module, Post.Module],
  controllers: [Controller],
  providers: [Service],
})
export default class Module {}

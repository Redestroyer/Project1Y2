import { Controller as $Controller, Get } from '@nestjs/common';
import Service from './service';

@$Controller()
export default class Controller {
  constructor(private readonly appService: Service) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}

import { Injectable } from '@nestjs/common';

@Injectable()
export default class Service {
  getHello(): string {
    return 'Hello World!';
  }
}

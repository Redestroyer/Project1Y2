import { Test, TestingModule } from '@nestjs/testing';
import Controller from './controller';
import Service from './service';

describe('AppController', () => {
  let appController: Controller;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [Controller],
      providers: [Service],
    }).compile();

    appController = app.get<Controller>(Controller);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});

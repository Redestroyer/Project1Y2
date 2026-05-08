import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import App from './app';
import QueryString from 'qs';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    App.Module,
    new FastifyAdapter({
      logger: true,
      querystringParser: str => QueryString.parse(str)
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch(err => {
  console.error(err);
  process.exit(1);
});

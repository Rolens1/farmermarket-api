import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  const configuredOrigins = (process.env.CORS_ORIGIN ?? '')
    .split(',')
    .map((o) => o.trim().replace(/\/$/, ''))
    .filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      const normalized = origin.replace(/\/$/, '');
      const isLocalhost = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(
        normalized,
      );
      const isVercel = /^https:\/\/.*\.vercel\.app$/.test(normalized);
      const isConfigured = configuredOrigins.includes(normalized);

      if (isLocalhost || isVercel || isConfigured || configuredOrigins.length === 0) {
        callback(null, true);
      } else {
        // Fallback to allow connection from web client
        callback(null, true);
      }
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Accept,Authorization',
  });

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();

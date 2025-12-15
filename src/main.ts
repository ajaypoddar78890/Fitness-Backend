import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import helmet from 'helmet';
import * as morgan from 'morgan';
import rateLimit from 'express-rate-limit';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Set trust proxy BEFORE rate limiting - access Express instance
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', false);  // Don't trust X-Forwarded-For headers
  
  // app.use(helmet()); // Disabled for dev to avoid CSP blocking emulator requests
  app.use(morgan('dev'));
  app.enableCors({
    origin: true, // Allow all origins for dev; restrict in prod
    credentials: true,
  });
  
  // Configure rate limiter (remove trustProxy from here)
  app.use(rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 60_000,
    max: Number(process.env.RATE_LIMIT_MAX) || 100,
    skip: (req) => req.ip === '127.0.0.1' || req.ip === '::1', // Optional: skip localhost
  }));
  
  const port = process.env.PORT || 4000;
  await app.listen(port, '0.0.0.0');  // Bind to all interfaces
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📱 Android Emulator: http://10.0.2.2:${port}`);
  console.log(`🌐 Network: http://192.168.1.5:${port}`);
}
bootstrap();

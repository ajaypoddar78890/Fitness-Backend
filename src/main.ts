import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import helmet from 'helmet';
import * as morgan from 'morgan';
import rateLimit from 'express-rate-limit';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // app.use(helmet()); // Disabled for dev to avoid CSP blocking emulator requests
  app.use(morgan('dev'));
  app.enableCors({
    origin: true, // Allow all origins for dev; restrict in prod
    credentials: true,
  });
  app.use(rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 60_000,
    max: Number(process.env.RATE_LIMIT_MAX) || 100
  }));
  const port = process.env.PORT || 4000;
  await app.listen(port, '0.0.0.0');  // Bind to all interfaces
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📱 Android Emulator: http://10.0.2.2:${port}`);
  console.log(`🌐 Network: http://192.168.1.5:${port}`);  // Updated with correct IP
}
bootstrap();

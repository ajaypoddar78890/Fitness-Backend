import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User, UserSchema } from '../../schemas/user.schema';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { JwtStrategy } from '../../common/strategies/jwt.strategy';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import { FirebaseService } from '../../services/firebase.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    PassportModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    UsersModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_SECRET') || 'your_default_secret_change_me',
        signOptions: {
          expiresIn: configService.get<string>('JWT_ACCESS_EXPIRES_IN') || '1h',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, JwtAuthGuard, JwtStrategy, FirebaseAuthGuard, FirebaseService],
  controllers: [AuthController],
  exports: [AuthService, FirebaseService, JwtAuthGuard],
})
export class AuthModule {}

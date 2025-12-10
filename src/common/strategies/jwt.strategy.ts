import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET') || 'your_default_secret_change_me',
    });
  }

  async validate(payload: any) {
    if (!payload.uid || !payload.email) {
      throw new UnauthorizedException('Invalid token payload');
    }
    return {
      uid: payload.uid,
      email: payload.email,
      name: payload.name,
      authProvider: payload.authProvider,
    };
  }
}
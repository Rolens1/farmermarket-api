import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { passportJwtSecret } from 'jwks-rsa';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    const insforgeUrl =
      configService.get<string>('INSFORGE_URL') ||
      configService.get<string>('SUPABASE_URL') ||
      '';

    if (!insforgeUrl) {
      throw new Error(
        'Missing JWT configuration: INSFORGE_URL or SUPABASE_URL must be set in environment variables.',
      );
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 10,
        jwksUri: `${insforgeUrl}/.well-known/jwks.json`,
      }),
      algorithms: ['RS256'],
    });
  }

  async validate(payload: Record<string, unknown>) {
    return {
      userId: payload.sub as string,
      email: payload.email as string,
      role: payload.role as string,
    };
  }
}

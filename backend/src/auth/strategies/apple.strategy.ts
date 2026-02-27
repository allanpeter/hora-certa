import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-apple';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class AppleStrategy extends PassportStrategy(Strategy, 'apple') {
  constructor(
    configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      teamID: configService.get<string>('APPLE_TEAM_ID'),
      keyID: configService.get<string>('APPLE_KEY_ID'),
      privateKey: configService.get<string>('APPLE_PRIVATE_KEY'),
      clientID: configService.get<string>('APPLE_CLIENT_ID'),
      callbackURL: configService.get<string>('APPLE_CALLBACK_URL'),
      passReqToCallback: true,
    });
  }

  async validate(
    req: any,
    _idToken: string,
    _refreshToken: string,
    profile: any,
  ): Promise<any> {
    const { id, emails } = profile;

    // Extract email from user object in request body (Apple may include it there)
    // On first login, Apple sends user info in request body
    let email = emails?.[0]?.value;
    let name = '';

    if (req.body.user) {
      const user = JSON.parse(req.body.user);
      email = user.email || email;
      name = [user.name?.firstName, user.name?.lastName]
        .filter(Boolean)
        .join(' ');
    }

    // If no email found, Apple might be using private email relay
    // In this case, use the Apple ID as both identifier and temporary email
    if (!email) {
      email = `${id}@privaterelay.appleid.com`;
    }

    const appleUser = await this.authService.validateOAuthUser({
      apple_id: id,
      email,
      name: name || 'Apple User',
      avatar_url: undefined, // Apple doesn't provide avatar
      email_verified: emails?.[0]?.verified || false,
    });

    return appleUser;
  }
}

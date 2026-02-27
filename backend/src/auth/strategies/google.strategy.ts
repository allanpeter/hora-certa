import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: any,
  ): Promise<any> {
    const { id, name, emails, photos, displayName } = profile;

    // Handle edge cases where profile fields might be missing
    const email = emails?.[0]?.value || profile.email || '';
    const fullName = displayName ||
      (name ? `${name.givenName || ''} ${name.familyName || ''}`.trim() : '') ||
      'Google User';
    const avatar = photos?.[0]?.value || undefined;
    const emailVerified = emails?.[0]?.verified || false;

    if (!email) {
      throw new Error('No email found in Google profile');
    }

    const user = await this.authService.validateOAuthUser({
      google_id: id,
      email,
      name: fullName,
      avatar_url: avatar,
      email_verified: emailVerified,
    });

    return user;
  }
}

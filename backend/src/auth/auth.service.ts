import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { UserType } from '../common/enums';
import { AuthResponseDto } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async validateOAuthUser(profile: {
    google_id: string;
    email: string;
    name: string;
    avatar_url?: string;
    email_verified: boolean;
  }): Promise<User> {
    // Find existing user by google_id or email
    let user = await this.userRepository.findOne({
      where: [
        { google_id: profile.google_id },
        { email: profile.email },
      ],
    });

    if (!user) {
      // Create new user
      user = this.userRepository.create({
        google_id: profile.google_id,
        email: profile.email,
        name: profile.name,
        avatar_url: profile.avatar_url,
        email_verified: profile.email_verified,
        user_type: UserType.CLIENT, // Default to CLIENT, can be changed later
      });
      await this.userRepository.save(user);
    } else {
      // Update existing user
      user.google_id = profile.google_id;
      user.name = profile.name;
      user.avatar_url = profile.avatar_url || user.avatar_url;
      user.email_verified = profile.email_verified;
      await this.userRepository.save(user);
    }

    return user;
  }

  async generateJwt(user: User): Promise<AuthResponseDto> {
    const payload = { email: user.email, sub: user.id };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar_url: user.avatar_url,
        user_type: user.user_type,
      },
    };
  }
}

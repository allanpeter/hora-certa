import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../database/entities/user.entity';
import { UserType } from '../common/enums';
import { AuthResponseDto } from './dto/auth-response.dto';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async validateOAuthUser(profile: {
    google_id?: string;
    apple_id?: string;
    email: string;
    name: string;
    avatar_url?: string;
    email_verified: boolean;
  }): Promise<User> {
    // Find existing user by OAuth IDs or email
    const searchConditions: any[] = [];
    if (profile.google_id) searchConditions.push({ google_id: profile.google_id });
    if (profile.apple_id) searchConditions.push({ apple_id: profile.apple_id });
    searchConditions.push({ email: profile.email });

    let user = await this.userRepository.findOne({
      where: searchConditions,
    });

    if (!user) {
      // Create new user
      user = this.userRepository.create({
        google_id: profile.google_id,
        apple_id: profile.apple_id,
        email: profile.email,
        name: profile.name,
        avatar_url: profile.avatar_url,
        email_verified: profile.email_verified,
        user_type: UserType.CLIENT, // Default to CLIENT, can be changed later
      });
      await this.userRepository.save(user);
    } else {
      // Update existing user with OAuth IDs and profile
      if (profile.google_id) user.google_id = profile.google_id;
      if (profile.apple_id) user.apple_id = profile.apple_id;
      user.name = profile.name;
      user.avatar_url = profile.avatar_url || user.avatar_url;
      user.email_verified = profile.email_verified;
      await this.userRepository.save(user);
    }

    return user;
  }

  async signup(signupDto: SignupDto): Promise<AuthResponseDto> {
    const existingUser = await this.userRepository.findOne({
      where: { email: signupDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    const password_hash = await bcrypt.hash(signupDto.password, 10);

    // Clean phone number: remove formatting characters
    const cleanPhone = signupDto.phone ? signupDto.phone.replace(/\D/g, '') : undefined;

    const user = this.userRepository.create({
      email: signupDto.email,
      password_hash,
      name: signupDto.name,
      phone: cleanPhone,
      user_type: UserType.CLIENT,
      email_verified: false,
    });

    await this.userRepository.save(user);
    return this.generateJwt(user);
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!user || !user.password_hash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await this.validatePassword(
      loginDto.password,
      user.password_hash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.generateJwt(user);
  }

  async validatePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
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

import { Controller, Get, Post, UseGuards, Req, Res, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { AppleAuthGuard } from './guards/apple-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '../database/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { SignupDto } from './dto/signup.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Post('signup')
  @ApiOperation({ summary: 'Create user with email and password' })
  async signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Initiate Google OAuth login' })
  async googleAuth() {
    // Redirects to Google
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Google OAuth callback' })
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    try {
      if (!req.user) {
        throw new Error('No user found after Google authentication');
      }

      const jwt = await this.authService.generateJwt(req.user as User);

      // Redirect to frontend with token
      const frontendUrl = this.configService.get<string>('FRONTEND_URL');
      const redirectUrl = `${frontendUrl}?token=${jwt.access_token}`;

      res.redirect(redirectUrl);
    } catch (error) {
      console.error('Google callback error:', error);
      res.status(500).json({
        statusCode: 500,
        message: `OAuth callback failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  }

  @Post('apple')
  @UseGuards(AppleAuthGuard)
  @ApiOperation({ summary: 'Initiate Apple OAuth login' })
  async appleAuth() {
    // Redirects to Apple
  }

  @Post('apple/callback')
  @UseGuards(AppleAuthGuard)
  @ApiOperation({ summary: 'Apple OAuth callback' })
  async appleAuthCallback(@Req() req: Request, @Res() res: Response) {
    try {
      if (!req.user) {
        throw new Error('No user found after Apple authentication');
      }

      const jwt = await this.authService.generateJwt(req.user as User);

      // Redirect to frontend with token
      const frontendUrl = this.configService.get<string>('FRONTEND_URL');
      res.redirect(`${frontendUrl}?token=${jwt.access_token}`);
    } catch (error) {
      console.error('Apple callback error:', error);
      res.status(500).json({
        statusCode: 500,
        message: `OAuth callback failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@CurrentUser() user: User) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar_url: user.avatar_url,
      user_type: user.user_type,
    };
  }
}

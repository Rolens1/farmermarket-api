/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Controller, Post, Body, UseGuards, Req, Get } from '@nestjs/common';
import { SignupDto } from './dto/signup.dto';
import { AuthService } from './auth.service';
import { SigninDto } from './dto/signin.dto';
import { AuthGuard } from '@nestjs/passport/dist/auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signUp(@Body() signupDto: SignupDto) {
    return this.authService.signUp(signupDto);
  }

  @Post('signin')
  async signIn(@Body() signinDto: SigninDto) {
    return this.authService.signIn(signinDto);
  }

  @Post('signout')
  @UseGuards(AuthGuard('jwt'))
  async signOut() {
    return this.authService.signOut();
  }

  @Post('refresh')
  async refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }

  private extractToken(req: any): string {
    const authHeader = req.headers.authorization as string;
    if (!authHeader) {
      throw new Error('Authorization header not found');
    }
    return authHeader.replace('Bearer ', '');
  }

  @Get('me')
  //   @UseGuards(AuthGuard('jwt'))
  async me(@Req() req: any) {
    const accessToken = this.extractToken(req);
    return this.authService.me(accessToken);
  }
}

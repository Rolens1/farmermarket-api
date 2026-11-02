/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';

@Injectable()
export class AuthService {
  constructor(private supabaseService: SupabaseService) {}

  private getSupabase() {
    return this.supabaseService.getClient();
  }

  async signUp(SignupDto: SignupDto) {
    const { email, password } = SignupDto;

    const { data, error } = await this.getSupabase().auth.signUp({
      email,
      password,
    });

    if (error) {
      const msg = error.message?.toLowerCase() ?? '';
      if (
        msg.includes('already') ||
        msg.includes('exist') ||
        (error as any).error === 'AUTH_EMAIL_EXISTS'
      ) {
        throw new ConflictException('Email is already registered');
      }
      throw new BadRequestException(error.message || 'Registration failed');
    }

    return {
      user: data?.user ?? null,
      session: data?.session ?? null,
    };
  }

  async signIn(SignInDto: SigninDto) {
    const { email, password } = SignInDto;

    const { data, error } = await this.getSupabase().auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data?.session?.access_token) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      user: data.user,
    };
  }

  async signOut() {
    const { error } = await this.getSupabase().auth.signOut();
    if (error) {
      throw new UnauthorizedException('Failed to sign out');
    }
    return { message: 'Successfully signed out' };
  }

  async refreshToken(refreshToken: string) {
    const { data, error } =
      await this.getSupabase().auth.refreshToken(refreshToken);
    if (error || !data?.session) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
    };
  }

  async me(accessToken: string) {
    const { data, error } = await this.getSupabase().auth.getUser(accessToken);

    if (error || !data?.user) {
      throw new UnauthorizedException('Invalid access token');
    }

    return {
      user: data.user,
    };
  }
}

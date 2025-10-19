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
      if (error.message.includes('already registered')) {
        throw new ConflictException('Email is already registered');
      }
      throw new BadRequestException(error.message);
    }

    return {
      user: data.user,
      session: data.session,
    };
  }

  async signIn(SignInDto: SigninDto) {
    const { email, password } = SignInDto;

    const { data, error } = await this.getSupabase().auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      user: data.user,
    };
  }

  async signOut() {
    // use the supabase client getter and pass an object with the expected shape
    const { error } = await this.getSupabase().auth.signOut({});
    if (error) {
      throw new UnauthorizedException('Failed to sign out');
    }
    return { message: 'Successfully signed out' };
  }

  async refreshToken(refreshToken: string) {
    const { data, error } = await this.getSupabase().auth.refreshSession({
      refresh_token: refreshToken,
    });
    if (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    if (!data.session) {
      throw new UnauthorizedException('No session returned');
    }
    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
    };
  }

  async me(accessToken: string) {
    const { data, error } = await this.getSupabase().auth.getUser(accessToken);

    if (error) {
      throw new UnauthorizedException('Invalid access token');
    }

    return {
      user: data.user,
    };
  }
}

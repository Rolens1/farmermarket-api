/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private client: any;
  private baseUrl: string;
  private anonKey: string;

  constructor(private configService: ConfigService) {
    this.baseUrl =
      this.configService.get<string>('INSFORGE_URL') ||
      this.configService.get<string>('SUPABASE_URL') ||
      '';
    this.anonKey =
      this.configService.get<string>('INSFORGE_ANON_KEY') ||
      this.configService.get<string>('SUPABASE_ANON_KEY') ||
      '';

    if (!this.baseUrl || !this.anonKey) {
      throw new Error(
        'Missing database configuration: INSFORGE_URL and INSFORGE_ANON_KEY environment variables must be set.',
      );
    }
  }

  async onModuleInit() {
    await this.initClient();
  }

  private async initClient() {
    if (!this.client) {
      const { createClient } = (await (eval('import("@insforge/sdk")') as Promise<any>)) as any;
      this.client = createClient({
        baseUrl: this.baseUrl,
        anonKey: this.anonKey,
      });
    }
    return this.client;
  }

  getClient(): any {
    return {
      from: (table: string) => {
        if (!this.client) {
          throw new Error('Insforge client is still initializing');
        }
        return this.client.database.from(table);
      },
      auth: {
        signUp: async (opts: { email: string; password: string }) => {
          const client = await this.initClient();
          const res = await client.auth.signUp(opts);
          if (res.error || !res.data) {
            return {
              data: null,
              error: res.error ?? new Error('Sign up failed'),
            };
          }
          return { data: res.data, error: null };
        },
        signInWithPassword: async (opts: { email: string; password: string }) => {
          const client = await this.initClient();
          const res = await client.auth.signInWithPassword(opts);
          if (res.error || !res.data?.accessToken) {
            return {
              data: null,
              error: res.error ?? new Error('Invalid credentials'),
            };
          }
          return {
            data: {
              session: {
                access_token: res.data.accessToken,
                refresh_token: res.data.accessToken,
              },
              user: res.data.user,
            },
            error: null,
          };
        },
        signOut: async () => {
          const client = await this.initClient();
          await client.auth.signOut();
          return { error: null };
        },
        refreshToken: async (token: string) => {
          return {
            data: {
              session: {
                access_token: token,
                refresh_token: token,
              },
            },
            error: null,
          };
        },
        getUser: async (token: string) => {
          const res = await fetch(`${this.baseUrl}/api/auth/sessions/current`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!res.ok) {
            return { data: { user: null }, error: new Error('Invalid token') };
          }
          const data = await res.json();
          return { data: { user: data.user }, error: null };
        },
      },
      storage: {
        from: (bucket: string) => {
          return this.client.storage.from(bucket);
        },
      },
    };
  }
}

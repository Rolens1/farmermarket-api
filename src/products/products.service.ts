/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import {
  CreateProductDto,
  //   UpdateProductDto,
  Product,
} from './types/product.types';

@Injectable()
export class ProductsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  private getSupabaseClient() {
    return this.supabaseService.getClient();
  }

  private async getUserIdFromRequest(req: any): Promise<string> {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.replace('Bearer ', '')
      : authHeader;

    if (!token) {
      throw new Error('Access token is required');
    }

    const { data: user, error } =
      await this.getSupabaseClient().auth.getUser(token);
    if (error || !user || !user.user) {
      throw new Error('Invalid or expired access token');
    }
    return user.user.id;
  }

  async createProduct(
    createProductDto: CreateProductDto,
    req: any,
  ): Promise<Product> {
    const seller_id = await this.getUserIdFromRequest(req);

    const { data, error: insertError } = await this.getSupabaseClient()
      .from('products')
      .insert([
        {
          ...createProductDto,
          seller_id,
          is_available: true,
        },
      ]);

    if (insertError) {
      const message =
        (insertError as any)?.message ?? 'Failed to insert product';
      throw new Error(message);
    }

    return data as unknown as Product;
  }

  async findAllProducts(): Promise<Product[]> {
    const { data, error } = await this.getSupabaseClient()
      .from('products')
      .select();

    if (error) {
      throw new Error(error.message);
    }

    return data as Product[];
  }

  async findUserProducts(req: any): Promise<Product[]> {
    const userId = await this.getUserIdFromRequest(req);
    const { data, error } = await this.getSupabaseClient()
      .from('products')
      .select()
      .eq('seller_id', userId);

    if (error) {
      throw new Error(error.message);
    }

    return data as Product[];
  }
}

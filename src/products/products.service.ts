/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import {
  CreateProductDto,
  //   UpdateProductDto,
  ProductInterface as Product,
  SearchParams as ProductSearchParamsInterface,
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

  async searchQuery(params: ProductSearchParamsInterface) {
    const {
      query,
      category,
      minPrice = 0,
      maxPrice = 1000000,
      distance,
      pickupAvailable = false,
      deliveryAvailable = false,
      cursor,
      take = 20,
    } = params;

    let supabaseQuery = this.getSupabaseClient()
      .from('products')
      .select(
        `
         *
        `,
        { count: 'exact' },
      )
      .eq('is_available', true)
      .gte('price', minPrice)
      .lte('price', maxPrice)
      .order('created_at', { ascending: false })
      .limit(Math.min(take, 50));

    if (query) {
      supabaseQuery = supabaseQuery.or(
        `name.ilike.%${query}%,description.ilike.%${query}%`,
      );
    }
    if (category) {
      supabaseQuery = supabaseQuery.eq('category', category);
    }

    if (distance) {
      // Assuming you have user's location stored in params as latitude and longitude
      // You would need to adjust this part based on how you get user's location
      const userLatitude = 0; // Replace with actual latitude
      const userLongitude = 0; // Replace with actual longitude

      supabaseQuery = supabaseQuery.filter(
        'location',
        'st_dwithin',
        `st_makepoint(${userLongitude}, ${userLatitude})::geography, ${distance}`,
      );
    }

    if (pickupAvailable) {
      supabaseQuery = supabaseQuery.eq('pickup_available', true);
    }

    if (deliveryAvailable) {
      supabaseQuery = supabaseQuery.eq('delivery_available', true);
    }

    if (cursor) {
      supabaseQuery = supabaseQuery.lt('created_at', cursor);
    }

    const { data, error, count } = await supabaseQuery;

    if (error) {
      throw new Error(error.message);
    }
    return {
      products: data,
      totalCount: count,
      hasMore: data.length === take,
      nextCursor: data.length > 0 ? data[data.length - 1].created_at : null,
    };
  }

  async createProduct(
    createProductDto: CreateProductDto,
    req: any,
  ): Promise<Product> {
    const seller_id = await this.getUserIdFromRequest(req);
    const slug = generateSlug(createProductDto.name, seller_id);

    const { data, error: insertError } = await this.getSupabaseClient()
      .from('products')
      .insert([
        {
          ...createProductDto,
          seller_id,
          is_available: true,
          slug,
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

  async deleteProduct(
    req: any,
    productId: string,
  ): Promise<{ message: string }> {
    const userId = await this.getUserIdFromRequest(req);
    const { data, error } = await this.getSupabaseClient()
      .from('products')
      .delete()
      .eq('id', productId)
      .eq('seller_id', userId);

    if (error) {
      throw new Error(error.message);
    }

    return { message: `Product deleted successfully ${data}` };
  }

  async updateProduct(
    req: any,
    productId: string,
    updateProductDto: Partial<CreateProductDto>,
  ): Promise<Product> {
    const userId = await this.getUserIdFromRequest(req);
    const { data, error } = await this.getSupabaseClient()
      .from('products')
      .update(updateProductDto)
      .eq('id', productId)
      .eq('seller_id', userId)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data as Product;
  }

  async findProductById(productId: string): Promise<Product> {
    const { data, error } = await this.getSupabaseClient()
      .from('products')
      .select()
      .eq('id', productId)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data as Product;
  }

  async findBySlug(slug: string): Promise<Product | null> {
    const { data, error } = await this.getSupabaseClient()
      .from('products')
      .select() // seller:seller_id (id, full_name, email)
      .eq('slug', slug)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data as Product;
  }
}

function generateSlug(name: string, id: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .trim() +
    '-' +
    id.slice(0, 4)
  );
}

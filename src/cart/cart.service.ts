/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import { SupabaseService } from 'src/supabase/supabase.service';
// import { Cart } from './types/cart.types';

@Injectable()
export class CartService {
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

  async getUserCart(req: any) {
    const client = this.getSupabaseClient();
    const userId = await this.getUserIdFromRequest(req);
    // Get or create the user's cart
    let { data: cart, error: cartError } = await client
      .from('cart')
      .select('id')
      .eq('user_id', userId)
      .single();
    if (cartError && cartError.code === 'PGRST116') {
      // No cart, create one
      const { data: newCart, error: createError } = await client
        .from('cart')
        .insert({ user_id: userId })
        .select('id')
        .single();
      if (createError) {
        throw new Error(`Failed to create cart: ${createError.message}`);
      }
      cart = newCart;
    } else if (cartError) {
      throw new Error(`Failed to get cart: ${cartError.message}`);
    }
    // Get cart items
    const { data, error } = await client
      .from('cart_item')
      .select('*, product:product_id(*)')
      .eq('cart_id', cart?.id);
    if (error) {
      throw new Error(`Failed to retrieve cart items: ${error.message}`);
    }
    return data;
  }

  async addToCart(req: any, productId: string, quantity: number) {
    const client = this.getSupabaseClient();
    const userId = await this.getUserIdFromRequest(req);
    // Get or create the user's cart
    let { data: cart, error: cartError } = await client
      .from('cart')
      .select('id')
      .eq('user_id', userId)
      .single();
    if (cartError && cartError.code === 'PGRST116') {
      // No cart, create one
      const { data: newCart, error: createError } = await client
        .from('cart')
        .insert({ user_id: userId })
        .select('id')
        .single();
      if (createError) {
        throw new Error(`Failed to create cart: ${createError.message}`);
      }
      cart = newCart;
    } else if (cartError) {
      throw new Error(`Failed to get cart: ${cartError.message}`);
    }
    // Check if item exists
    const { data: existing, error: findError } = await client
      .from('cart_item')
      .select('*')
      .eq('cart_id', cart?.id)
      .eq('product_id', productId)
      .single();
    if (findError && findError.code !== 'PGRST116') {
      throw new Error(`Failed to check cart: ${findError.message}`);
    }
    if (existing) {
      // Update quantity
      const { error: updateError } = await client
        .from('cart_item')
        .update({ quantity: existing.quantity + quantity })
        .eq('id', existing.id);
      if (updateError) {
        throw new Error(`Failed to update cart: ${updateError.message}`);
      }
      return { message: 'Cart updated' };
    } else {
      // Insert new
      const { error: insertError } = await client
        .from('cart_item')
        .insert({ cart_id: cart?.id, product_id: productId, quantity });
      if (insertError) {
        throw new Error(`Failed to add to cart: ${insertError.message}`);
      }
      return { message: 'Added to cart' };
    }
  }

  async updateQuantity(req: any, productId: string, quantity: number) {
    const client = this.getSupabaseClient();
    const userId = await this.getUserIdFromRequest(req);
    // Get or create the user's cart
    let { data: cart, error: cartError } = await client
      .from('cart')
      .select('id')
      .eq('user_id', userId)
      .single();
    if (cartError && cartError.code === 'PGRST116') {
      // No cart, create one
      const { data: newCart, error: createError } = await client
        .from('cart')
        .insert({ user_id: userId })
        .select('id')
        .single();
      if (createError) {
        throw new Error(`Failed to create cart: ${createError.message}`);
      }
      cart = newCart;
    } else if (cartError) {
      throw new Error(`Failed to get cart: ${cartError.message}`);
    }
    const { error } = await client
      .from('cart_item')
      .update({ quantity })
      .eq('cart_id', cart?.id)
      .eq('product_id', productId);
    if (error) {
      throw new Error(`Failed to update quantity: ${error.message}`);
    }
    return { message: 'Quantity updated' };
  }

  async removeFromCart(req: any, productId: string) {
    const client = this.getSupabaseClient();
    const userId = await this.getUserIdFromRequest(req);
    // Get or create the user's cart
    let { data: cart, error: cartError } = await client
      .from('cart')
      .select('id')
      .eq('user_id', userId)
      .single();
    if (cartError && cartError.code === 'PGRST116') {
      // No cart, create one
      const { data: newCart, error: createError } = await client
        .from('cart')
        .insert({ user_id: userId })
        .select('id')
        .single();
      if (createError) {
        throw new Error(`Failed to create cart: ${createError.message}`);
      }
      cart = newCart;
    } else if (cartError) {
      throw new Error(`Failed to get cart: ${cartError.message}`);
    }
    const { error } = await client
      .from('cart_item')
      .delete()
      .eq('cart_id', cart?.id)
      .eq('product_id', productId);
    if (error) {
      throw new Error(`Failed to remove from cart: ${error.message}`);
    }
    return { message: 'Removed from cart' };
  }

  async clearCart(req: any) {
    const client = this.getSupabaseClient();
    const userId = await this.getUserIdFromRequest(req);
    // Get or create the user's cart
    let { data: cart, error: cartError } = await client
      .from('cart')
      .select('id')
      .eq('user_id', userId)
      .single();
    if (cartError && cartError.code === 'PGRST116') {
      // No cart, create one
      const { data: newCart, error: createError } = await client
        .from('cart')
        .insert({ user_id: userId })
        .select('id')
        .single();
      if (createError) {
        throw new Error(`Failed to create cart: ${createError.message}`);
      }
      cart = newCart;
    } else if (cartError) {
      throw new Error(`Failed to get cart: ${cartError.message}`);
    }
    const { error } = await client
      .from('cart_item')
      .delete()
      .eq('cart_id', cart?.id);
    if (error) {
      throw new Error(`Failed to clear cart: ${error.message}`);
    }
    return { message: 'Cart cleared' };
  }
}

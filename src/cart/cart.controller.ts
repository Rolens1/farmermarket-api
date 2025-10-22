/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  async getCart(@Request() req) {
    return await this.cartService.getUserCart(req);
  }

  @Post()
  async addToCart(
    @Request() req,
    @Body() body: { productId: string; quantity: number },
  ) {
    return await this.cartService.addToCart(req, body.productId, body.quantity);
  }

  @Put()
  async updateQuantity(
    @Request() req,
    @Body() body: { productId: string; quantity: number },
  ) {
    return await this.cartService.updateQuantity(
      req,
      body.productId,
      body.quantity,
    );
  }

  @Delete()
  async removeFromCart(@Request() req, @Body() body: { productId: string }) {
    return await this.cartService.removeFromCart(req, body.productId);
  }

  @Delete('clear')
  async clearCart(@Request() req) {
    return await this.cartService.clearCart(req);
  }
}

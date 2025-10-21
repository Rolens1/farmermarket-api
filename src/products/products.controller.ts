/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  //   UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
// import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateProductDto } from './types/product.types';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post('create')
  //   @UseGuards(JwtAuthGuard)
  createProduct(@Body() createProductDto: CreateProductDto, @Request() req) {
    return this.productsService.createProduct(createProductDto, req);
  }

  @Get()
  findAllProducts() {
    return this.productsService.findAllProducts();
  }

  @Get('user')
  findUserProducts(@Request() req) {
    return this.productsService.findUserProducts(req);
  }

  @Post('delete/:id')
  //   @UseGuards(JwtAuthGuard)
  deleteProduct(@Request() req, @Param('id') id: string) {
    return this.productsService.deleteProduct(req, id);
  }

  @Get(':id')
  findProductById(@Param('id') id: string) {
    return this.productsService.findProductById(id);
  }

  @Get('slug/:slug')
  findProductBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  @Post('update/:id')
  updateProduct(
    @Param('id') id: string,
    @Body() updateProductDto: Partial<CreateProductDto>,
    @Request() req,
  ) {
    return this.productsService.updateProduct(req, id, updateProductDto);
  }
}

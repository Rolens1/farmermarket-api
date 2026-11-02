import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProductsService } from './products.service';
import { CreateProductDto, SearchParams } from './types/product.types';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post('create')
  @UseGuards(AuthGuard('jwt'))
  createProduct(@Body() createProductDto: CreateProductDto, @Request() req) {
    return this.productsService.createProduct(createProductDto, req);
  }

  @Get()
  findAllProducts() {
    return this.productsService.findAllProducts();
  }

  @Get('user')
  @UseGuards(AuthGuard('jwt'))
  findUserProducts(@Request() req) {
    return this.productsService.findUserProducts(req);
  }

  @Delete('delete/:id')
  @UseGuards(AuthGuard('jwt'))
  deleteProduct(@Request() req, @Param('id') id: string) {
    return this.productsService.deleteProduct(req, id);
  }

  // Keep POST alias for backward compatibility with existing frontend calls
  @Post('delete/:id')
  @UseGuards(AuthGuard('jwt'))
  deleteProductPost(@Request() req, @Param('id') id: string) {
    return this.productsService.deleteProduct(req, id);
  }

  @Get('i/:id')
  findProductById(@Param('id') id: string) {
    return this.productsService.findProductById(id);
  }

  @Get('slug/:slug')
  findProductBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  @Patch('update/:id')
  @UseGuards(AuthGuard('jwt'))
  updateProduct(
    @Param('id') id: string,
    @Body() updateProductDto: Partial<CreateProductDto>,
    @Request() req,
  ) {
    return this.productsService.updateProduct(req, id, updateProductDto);
  }

  // Keep POST alias for backward compatibility with existing frontend calls
  @Post('update/:id')
  @UseGuards(AuthGuard('jwt'))
  updateProductPost(
    @Param('id') id: string,
    @Body() updateProductDto: Partial<CreateProductDto>,
    @Request() req,
  ) {
    return this.productsService.updateProduct(req, id, updateProductDto);
  }

  @Get('s/')
  searchQuery(@Request() req) {
    const params = req.query as unknown;
    return this.productsService.searchQuery(params as SearchParams);
  }
}

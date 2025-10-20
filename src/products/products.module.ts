import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';

@Module({})
export class ProductsModule {
  imports: [AuthModule];
  providers: [ProductsService];
  controllers: [ProductsController];
  exports: [ProductsService];
}

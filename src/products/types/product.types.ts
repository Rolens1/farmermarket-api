/* eslint-disable @typescript-eslint/no-empty-object-type */
// src/products/types/product.types.ts
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  category: string;
  quantity: number;
  is_available: boolean;
  seller_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProductDto {
  name: string;
  description: string;
  price: number;
  image?: string;
  category: string;
  quantity: number;
}

export interface UpdateProductDto extends Partial<CreateProductDto> {}

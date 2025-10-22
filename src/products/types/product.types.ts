/* eslint-disable @typescript-eslint/no-empty-object-type */
export interface ProductInterface {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string[];
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
  image?: string[];
  category: string;
  quantity: number;
  imageUrl?: string[];
}

export interface UpdateProductDto extends Partial<CreateProductDto> {}

export interface SearchParams {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  distance?: number;
  pickupAvailable?: boolean;
  deliveryAvailable?: boolean;
  cursor?: string;
  take?: number;
}

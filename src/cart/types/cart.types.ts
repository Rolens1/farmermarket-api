type CartItem = {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
};
export type Cart = {
  user_id?: string;
  items: CartItem[];
};

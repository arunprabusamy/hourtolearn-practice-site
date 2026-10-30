export interface Product {
  id: number;
  name: string;
  price: number;
  emoji: string;
  inStock: boolean;
}

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

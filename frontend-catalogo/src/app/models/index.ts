export interface Product {
  id: number;
  name: string;
  description: string | null;
  sku: string | null;
  categoryCode: string | null;
  categoryId: number | null;
  categoryName: string | null;
  brand: string | null;
  brandId: number | null;
  price: number;
  compareAtPrice: number | null;
  stockQuantity: number;
  imageUrl: string | null;
}

export interface Recommendation {
  productId: number;
  name: string;
  categoryCode: string | null;
  brand: string | null;
  price: number | null;
  imageUrl: string | null;
  score: number;
}

export interface AuthResponse {
  token: string;
  userId: number;
  email: string;
}

export interface OrderItem {
  id: number;
  product: Product;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  status: OrderStatus;
  subtotal: number;
  shippingCost: number;
  total: number;
  shippingAddress: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

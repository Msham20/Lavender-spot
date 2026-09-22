export interface Category {
  id: string;
  name: string;
  slug: string;
  image_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  is_primary: boolean;
  display_order: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discount_price?: number | null;
  category_id?: string | null;
  category_name?: string;
  skin_type: string;
  stock: number;
  status: 'active' | 'draft';
  is_bestseller: boolean;
  is_new_arrival: boolean;
  rating: number;
  review_count: number;
  ingredients?: string[];
  benefits?: string[];
  sizes?: string[];
  images?: ProductImage[];
  primary_image?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CartItem {
  id?: string;
  product_id: string;
  product: Product;
  size: string;
  quantity: number;
}

export interface WishlistItem {
  id?: string;
  product_id: string;
  product: Product;
  created_at?: string;
}

export interface Address {
  id?: string;
  user_id?: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  is_default?: boolean;
}

export interface OrderItem {
  id?: string;
  order_id?: string;
  product_id: string;
  product_name: string;
  size: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Order {
  id: string;
  order_number: string;
  user_id?: string | null;
  subtotal: number;
  delivery_charge: number;
  discount_amount: number;
  total_amount: number;
  status: 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  payment_method: string;
  payment_status: string;
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_pincode: string;
  order_items?: OrderItem[];
  created_at: string;
  updated_at?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  is_admin: boolean;
  created_at?: string;
}

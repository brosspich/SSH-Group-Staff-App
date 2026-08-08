export interface Product {
  id: string;
  name: string;
  price: number;
  category_id: string;
  artwork: string | null;
  currency?: "usd" | "riel" | null;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
}

export interface Category {
  id: string;
  name: string;
}

export type OrderData = {
  id: string;
  total: number;
  items: CartItem[];
  customer: Customer;
  invoiceNumber: string;
  paymentMethod: "cash" | "khqr";
  discountPercent?: number;
  discountAmount?: number;
  subtotal?: number;
};

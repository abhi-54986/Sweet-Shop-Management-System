export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface Sweet {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  sweet: Sweet | string;
  quantity: number;
  price: number;
}

export interface DeliveryAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
}

export interface Order {
  _id: string;
  user: User | string;
  items: OrderItem[];
  totalAmount: number;
  status: 'Pending' | 'Processing' | 'Completed' | 'Cancelled';
  deliveryAddress: DeliveryAddress;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  sweet: Sweet;
  quantity: number;
}
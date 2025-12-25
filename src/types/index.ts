export type OrderStatus =
  | 'pending'
  | 'preparing'
  | 'ready'
  | 'served'
  | 'cancelled';
export type ItemStatus = 'initial' | 'preparing' | 'completed' | 'served';
export type KitchenArea = 'hot' | 'grill' | 'cold' | 'drinks';
export type OrderType = 'dine-in' | 'online';
export type UserRole = 'staff' | 'chef';

export interface OrderItem {
  id: string;
  name: string;
  variant?: string;
  toppings: string[];
  qty: number;
  notes?: string;
  status: ItemStatus;
  kitchenArea: KitchenArea;
  initialGroup?: boolean;
  addedGroup?: boolean;
  startTime?: Date;
  completedTime?: Date;
  timestamp?: string;
}

export interface Order {
  id: string;
  tableNumber?: number;
  customerName?: string;
  status: string;
  orderItems: OrderItem[];
  notes?: string;
  createdAt: Date;
  confirmedAt?: Date;
  completedAt?: Date;
  pickupTime?: string;
  deliveryAddress?: string;
  method?: string;
  keyRedis?: string;
  batchId?: string;
}

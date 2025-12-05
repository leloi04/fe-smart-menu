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
}

export interface Order {
  id: string;
  type: OrderType;
  tableNumber?: number;
  customerName?: string;
  status: OrderStatus;
  items: OrderItem[];
  notes?: string;
  createdAt: Date;
  confirmedAt?: Date;
  completedAt?: Date;
}

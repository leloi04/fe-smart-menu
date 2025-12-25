import { KitchenArea } from './global.d';
import { message } from 'antd';
export {};

export type KitchenArea = 'HOT' | 'GRILL' | 'COLD' | 'DRINK';

declare global {
  interface IBackendRes<T> {
    error: string | string[];
    message: string;
    statusCode: number | string;
    data: T;
  }

  interface IModalPaginate<T> {
    meta: {
      current: number;
      pageSize: number;
      pages: number;
      total: number;
    };
    result: T[];
  }

  interface ILogin {
    access_token: string;
    user: {
      email: string;
      phone: number | string;
      name: string;
      role: {
        _id: string;
        name: string;
      };
      avatar?: string;
      _id: string;
    };
  }

  interface IRegister {
    _id: string;
    email: string;
    fullName: string;
  }

  interface IUser {
    email: string;
    phone: number | string;
    name: string;
    role: {
      _id: string;
      name: string;
    };
    avatar?: string;
    _id: string;
  }

  interface IFetchAccount {
    user: IUser;
  }

  interface IUserModal {
    _id: string;
    name: string;
    email: string;
    phone: string;
    role: {
      _id: string;
      name: string;
    };
    avatar?: string;
    createdAt: Date;
    updatedAt: Date;
  }

  interface IResponseImport {
    countSuccess: number;
    countError: number;
    detail: any;
  }

  interface IMenuModal {
    _id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
    status: 'available' | 'out_of_stock';
    variants: {
      size: string;
      price: number;
      _id: string;
      isDeleted: boolean;
      deletedAt: string | null;
    }[];
    toppings: {
      name: string;
      price: number;
      _id: string;
      isDeleted: boolean;
      deletedAt: string | null;
    }[];
    kitchenArea: KitchenArea;
  }

  interface ITableModal {
    _id: string;
    tableNumber: string;
    descriptionPosition: string;
    currentOrder: string | null;
    token: string;
    seats: number;
    status: string;
  }

  interface IOrderModal {
    _id: string;
    tableId: string;
    orderItems: {
      variant: {
        _id: string;
        size: string;
        price: number;
      };
      menuItemId: string;
      name: string;
      quantity: number;
      toppings: {
        _id: string;
        name: string;
        price: number;
      }[];
      _id: string;
      kitchenArea: KitchenArea;
    }[];
    totalPrice: number;
    paymentStatus: string;
    progressStatus: string;
    customers: {
      userId: string;
      name: string;
      isGuest: boolean;
      _id: string;
    }[];
  }

  interface IReservation {
    _id: string;
    customerName: string;
    customerPhone: string;
    tableId: string;
    date: string;
    timeSlot: string;
    capacity: number;
    status: string;
    createdAt: Date;
    expiredAt: Date;
  }

  interface IPreOrder {
    _id: string;
    customerId: string;
    orderItems: {
      variant: {
        _id: string;
        size: string;
        price: number;
      };
      menuItemId: string;
      name: string;
      quantity: number;
      toppings: {
        _id: string;
        name: string;
        price: number;
      }[];
      _id: string;
      kitchenArea: KitchenArea;
    }[];
    totalPrice: number;
    paymentStatus: string;
    progressStatus: string;
    customers: {
      userId: string;
      name: string;
      isGuest: boolean;
      _id: string;
    }[];
    totalItemPrice: number;
    totalPayment: number;
    method: string;
    deliveryAddress: string;
    pickupTime: string;
    paymentStatus: string;
    tracking: {
      status: string;
      timestamp: Date;
      _id: string;
    }[];
    payment: string;
    note: string;
  }
}

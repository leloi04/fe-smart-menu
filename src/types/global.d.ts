import { message } from "antd";
export {};

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
      id: string;
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
    status: "available" | "out_of_stock";
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
}

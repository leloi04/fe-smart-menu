import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
} from 'react';

interface Variant {
  _id: string;
  size: string;
  price: number;
}

interface Topping {
  _id: string;
  name: string;
  price: number;
}

export interface CartItem {
  menuItemId: string;
  name: string;
  quantity: number;
  variant: Variant | null;
  toppings: Topping[];
  price: number;
}

interface ICartContext {
  cart: CartItem[];
  cartCount: number; // tổng số lượng
  totalPrice: number; // tổng giá
  addItem: (item: CartItem) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  removeItem: (menuItemId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<ICartContext | null>(null);

// =============================
// REDUCER
// =============================
function cartReducer(state: CartItem[], action: any): CartItem[] {
  let updated;

  switch (action.type) {
    case 'INIT':
      return action.payload;

    case 'ADD': {
      const exists = state.find(
        (i) =>
          i.menuItemId === action.payload.menuItemId &&
          JSON.stringify(i.variant) ===
            JSON.stringify(action.payload.variant) &&
          JSON.stringify(i.toppings) ===
            JSON.stringify(action.payload.toppings),
      );

      if (exists) {
        updated = state.map((i) =>
          i === exists
            ? { ...i, quantity: i.quantity + action.payload.quantity }
            : i,
        );
      } else {
        updated = [...state, action.payload];
      }

      localStorage.setItem('cart', JSON.stringify(updated));
      return updated;
    }

    case 'UPDATE_QTY':
      updated = state.map((item) =>
        item.menuItemId === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item,
      );
      localStorage.setItem('cart', JSON.stringify(updated));
      return updated;

    case 'REMOVE':
      updated = state.filter((item) => item.menuItemId !== action.payload.id);
      localStorage.setItem('cart', JSON.stringify(updated));
      return updated;

    case 'CLEAR':
      localStorage.removeItem('cart');
      return [];

    default:
      return state;
  }
}

// =============================
// PROVIDER
// =============================
export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, dispatch] = useReducer(cartReducer, []);
  const [cartCount, setCartCount] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  // Load dữ liệu từ localStorage khi reload
  useEffect(() => {
    const saved = localStorage.getItem('cart');
    if (saved) {
      const parsed = JSON.parse(saved);
      dispatch({ type: 'INIT', payload: parsed });
    }
  }, []);

  // Tính cartCount và totalPrice mỗi khi cart thay đổi
  useEffect(() => {
    const count = cart.length;
    const price = cart.reduce(
      (sum, i) =>
        sum +
        i.quantity *
          ((i.variant?.price ?? i.price) +
            i.toppings.reduce((tSum, t) => tSum + t.price, 0)),
      0,
    );

    setCartCount(count);
    setTotalPrice(price);
  }, [cart]);

  const addItem = (item: CartItem) => dispatch({ type: 'ADD', payload: item });
  const updateQuantity = (menuItemId: string, quantity: number) =>
    dispatch({ type: 'UPDATE_QTY', payload: { id: menuItemId, quantity } });
  const removeItem = (menuItemId: string) =>
    dispatch({ type: 'REMOVE', payload: { id: menuItemId } });
  const clearCart = () => dispatch({ type: 'CLEAR' });

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        totalPrice,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// =============================
// HOOK SỬ DỤNG
// =============================
export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
};

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
  price: number; // giá base khi không có variant
}

interface ICartContext {
  cart: CartItem[];
  cartCount: number;
  totalPrice: number;
  addItem: (item: CartItem) => void;
  updateItem: (
    menuItemId: string,
    data: {
      quantity?: number;
      variant?: Variant | null;
      toppings?: Topping[];
    },
  ) => void;
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

    // ⭐ NEW: UPDATE FULL ITEM (quantity + variant + toppings)
    case 'UPDATE_ITEM':
      updated = state.map((item) => {
        if (item.menuItemId !== action.payload.id) return item;

        const newQuantity = action.payload.data.quantity ?? item.quantity;
        const newVariant = action.payload.data.variant ?? item.variant;
        const newToppings = action.payload.data.toppings ?? item.toppings;

        // tính giá mới
        const variantPrice = newVariant?.price ?? item.price;
        const toppingPrice = newToppings.reduce(
          (s: any, t: any) => s + t.price,
          0,
        );
        const newTotalPrice = newQuantity * (variantPrice + toppingPrice);

        return {
          ...item,
          quantity: newQuantity,
          variant: newVariant,
          toppings: newToppings,
          // không lưu price tổng tại đây, chỉ lưu giá base
          totalPriceForThisItem: newTotalPrice,
        };
      });

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

  useEffect(() => {
    const saved = localStorage.getItem('cart');
    if (saved) {
      dispatch({ type: 'INIT', payload: JSON.parse(saved) });
    }
  }, []);

  // tự động tính tổng tiền
  useEffect(() => {
    const count = cart.length;

    const price = cart.reduce((sum, i) => {
      const variantPrice = i.variant?.price ?? i.price;
      const toppingPrice = i.toppings.reduce((t, tp) => t + tp.price, 0);
      return sum + i.quantity * (variantPrice + toppingPrice);
    }, 0);

    setCartCount(count);
    setTotalPrice(price);
  }, [cart]);

  const addItem = (item: CartItem) => dispatch({ type: 'ADD', payload: item });

  const updateItem = (
    menuItemId: string,
    data: { quantity?: number; variant?: Variant | null; toppings?: Topping[] },
  ) => dispatch({ type: 'UPDATE_ITEM', payload: { id: menuItemId, data } });

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
        updateItem, // ⭐ EXPORT NEW FUNCTION
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// =============================
// HOOK
// =============================
export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
};

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { storeService } from '../services/storeService';
import toast from 'react-hot-toast';

export interface CartItem {
  id: string; // Cart Item ID from backend
  productId: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  size?: string;
  color?: string;
  type: 'merch' | 'coins';
  stock: number;
  variantId?: number;
  variant?: string; // Descriptive string like "Red - Large"
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'id'>) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getCartTotal: () => number;
  getCartCount: () => number;
  cartCount: number; // Added property
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void; // Added setter
  toggleCart: () => void;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const { isLoggedIn } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Derived state
  const cartCount = items.reduce((count, item) => count + item.quantity, 0);

  // Fetch cart from backend when user logs in
  useEffect(() => {
    if (isLoggedIn) {
      fetchCart();
    } else {
      setItems([]); // Clear cart or load from local storage if supporting guest cart
    }
  }, [isLoggedIn]);

  const fetchCart = async () => {
    try {
      setIsLoading(true);
      const response = await storeService.getCart();
      
      // Handle various response structures
      let data = [];
      if (Array.isArray(response)) {
        data = response;
      } else if (response.data && Array.isArray(response.data)) {
        data = response.data;
      } else if (response.items && Array.isArray(response.items)) {
        data = response.items;
      } else if (response.cart && Array.isArray(response.cart)) {
          data = response.cart;
      }

      // Transform backend data to CartItem
      const mappedItems: CartItem[] = data.map((item: any) => ({
        id: item.id.toString(),
        productId: item.product_id || item.product?.id,
        name: item.product?.name || 'Unknown Product',
        price: parseFloat(item.price || item.product?.price || 0),
        quantity: item.quantity,
        image: item.product?.media?.[0]?.url || '', 
        type: item.product?.type === 'game_item' ? 'coins' : 'merch',
        stock: item.variant ? item.variant.stock_quantity : item.product?.stock_quantity || 0,
        variantId: item.variant_id,
        variant: item.variant 
          ? [item.variant.attributes?.color, item.variant.attributes?.size].filter(Boolean).join(' - ') 
          : undefined
      }));
      setItems(mappedItems);
    } catch (error) {
      console.error('Failed to fetch cart', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCart = () => setIsCartOpen(!isCartOpen);

  const addToCart = async (newItem: Omit<CartItem, 'id'>) => {
    if (!isLoggedIn) {
      toast.error('Please login to add items to cart');
      return;
    }

    try {
       setIsLoading(true);
       await storeService.addToCart(newItem.productId, newItem.quantity, newItem.variantId);
       
       toast.success('Added to cart!');
       fetchCart(); 
       setIsCartOpen(true);
    } catch (error: any) {
      console.error('Add to cart failed', error);
      toast.error(error.response?.data?.message || 'Failed to add to cart');
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      // Optimistic update
      // const previousItems = [...items]; // Unused variable removed
      setItems(items.filter(item => item.id !== itemId));

      await storeService.removeFromCart(itemId);
      toast.success('Item removed');
    } catch (error) {
      console.error('Remove from cart failed', error);
      toast.error('Failed to remove item');
      fetchCart(); // Revert
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    
    // Find item to check stock
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    if (quantity > item.stock) {
        toast.error(`Only ${item.stock} items available`);
        return;
    }

    try {
      // Optimistic update
      setItems(items.map(i => i.id === itemId ? { ...i, quantity } : i));
      
      await storeService.updateCartItem(itemId, quantity);
    } catch (error) {
      console.error('Update quantity failed', error);
      toast.error('Failed to update quantity');
      fetchCart(); // Revert
    }
  };

  const clearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      try {
        setItems([]);
        await storeService.clearCart();
        toast.success('Cart cleared');
      } catch (error) {
        console.error('Clear cart failed', error);
        fetchCart();
      }
    }
  };

  const getCartTotal = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
      getCartCount,
      cartCount,
      isCartOpen,
      setIsCartOpen,
      toggleCart,
      isLoading
    }}>
      {children}
    </CartContext.Provider>
  );
};

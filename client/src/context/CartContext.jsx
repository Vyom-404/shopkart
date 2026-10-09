import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  addToCart as addToCartRequest,
  getCart,
  removeFromCart as removeFromCartRequest,
  updateCartQuantity as updateCartQuantityRequest
} from '../services/api';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(true);
  const [cartError, setCartError] = useState(false);
  const [pendingProductIds, setPendingProductIds] = useState([]);
  const mutationQueue = useRef(Promise.resolve());
  const cartRevision = useRef(0);

  const refreshCart = useCallback(async () => {
    const requestedRevision = cartRevision.current;
    setCartLoading(true);
    setCartError(false);
    try {
      const { data } = await getCart();
      if (requestedRevision === cartRevision.current) setCartItems(data.cart);
    } catch {
      if (requestedRevision === cartRevision.current) setCartError(true);
    } finally {
      if (requestedRevision === cartRevision.current) setCartLoading(false);
    }
  }, []);

  useEffect(() => { refreshCart(); }, [refreshCart]);

  const runMutation = useCallback((productId, request) => {
    setPendingProductIds((ids) => ids.includes(productId) ? ids : [...ids, productId]);
    const operation = mutationQueue.current.then(async () => {
      const { data } = await request();
      cartRevision.current += 1;
      setCartItems(data.cart);
      setCartError(false);
      return data;
    });
    mutationQueue.current = operation.catch(() => {});
    return operation.finally(() => {
      setPendingProductIds((ids) => ids.filter((id) => id !== productId));
    });
  }, []);

  const addToCart = useCallback((productId) =>
    runMutation(productId, () => addToCartRequest(productId)), [runMutation]);
  const updateQuantity = useCallback((productId, quantity) =>
    runMutation(productId, () => updateCartQuantityRequest(productId, quantity)), [runMutation]);
  const removeFromCart = useCallback((productId) =>
    runMutation(productId, () => removeFromCartRequest(productId)), [runMutation]);

  const totalItems = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems]
  );
  const subtotal = useMemo(
    () => cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0),
    [cartItems]
  );

  const value = {
    cartItems,
    cartLoading,
    cartError,
    pendingProductIds,
    totalItems,
    subtotal,
    addToCart,
    updateQuantity,
    removeFromCart,
    refreshCart,
    isProductPending: (productId) => pendingProductIds.includes(productId)
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside CartProvider');
  return context;
}

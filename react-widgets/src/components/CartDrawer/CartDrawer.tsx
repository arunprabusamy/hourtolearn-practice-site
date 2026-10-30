import { useEffect, useState } from 'react';
import { CartItemRow } from '../CartItemRow/CartItemRow';
import type { CartItem } from '../../types';

export interface CartDrawerProps {
  items: CartItem[];
  loading?: boolean;
  error?: string | null;
  onQuantityChange?: (id: number, next: number) => void;
  onRemove?: (id: number) => void;
}

export function CartDrawer({ items, loading, error, onQuantityChange, onRemove }: CartDrawerProps) {
  // Seeded from the `items` prop so a single mounted story can demonstrate
  // live subtotal/line-total recalculation after a stepper interaction,
  // while still invoking the callback props for assertions.
  const [cartItems, setCartItems] = useState(items);

  useEffect(() => {
    setCartItems(items);
  }, [items]);

  function handleQuantityChange(id: number, next: number) {
    setCartItems((prev) => prev.map((item) => (item.id === id ? { ...item, quantity: next } : item)));
    onQuantityChange?.(id, next);
  }

  function handleRemove(id: number) {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
    onRemove?.(id);
  }

  if (loading) {
    return (
      <div role="status" data-testid="cart-drawer-loading">
        Loading cart...
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" data-testid="cart-drawer-error">
        {error}
      </div>
    );
  }

  if (cartItems.length === 0) {
    return <div data-testid="cart-drawer-empty">Your cart is empty.</div>;
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div data-testid="cart-drawer">
      {cartItems.map((item) => (
        <CartItemRow key={item.id} item={item} onQuantityChange={handleQuantityChange} onRemove={handleRemove} />
      ))}
      <div data-testid="cart-drawer-subtotal">${subtotal.toFixed(2)}</div>
    </div>
  );
}

import { useState } from 'react';
import { ToastNotification } from './components/ToastNotification/ToastNotification';
import { CartDrawer } from './components/CartDrawer/CartDrawer';
import { ProductFilterList } from './components/ProductFilterList/ProductFilterList';
import type { Product, CartItem } from './types';

const SAMPLE_PRODUCTS: Product[] = [
  { id: 1, name: 'Wireless Earbuds Pro', price: 79.99, emoji: '🎧', inStock: true },
  { id: 2, name: 'Smart Fitness Watch', price: 129.99, emoji: '⌚', inStock: true },
  { id: 3, name: 'Portable Bluetooth Speaker', price: 49.99, emoji: '🔊', inStock: true }
];

const MAX_QTY = 10;

export function App() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showToast, setShowToast] = useState(true);

  function handleAddToCart(product: Product) {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: Math.min(MAX_QTY, item.quantity + 1) } : item
        );
      }
      return [...prev, { id: product.id, name: product.name, price: product.price, quantity: 1 }];
    });
  }

  return (
    <div style={{ display: 'flex', gap: 24, padding: 24, fontFamily: 'sans-serif' }}>
      <div style={{ flex: 1 }}>
        <h1>Component Playground</h1>
        <p>This page is for manual viewing only — the real test suite lives in the *.story.tsx files.</p>
        {showToast && (
          <ToastNotification
            variant="info"
            message="This is the Cart Notifications Widget playground."
            onDismiss={() => setShowToast(false)}
          />
        )}
        <h2>Products</h2>
        <ProductFilterList products={SAMPLE_PRODUCTS} onAddToCart={handleAddToCart} />
      </div>
      <div style={{ flex: 1 }}>
        <h2>Cart</h2>
        <CartDrawer
          items={cartItems}
          onQuantityChange={(id, next) =>
            setCartItems((prev) => prev.map((item) => (item.id === id ? { ...item, quantity: next } : item)))
          }
          onRemove={(id) => setCartItems((prev) => prev.filter((item) => item.id !== id))}
        />
      </div>
    </div>
  );
}

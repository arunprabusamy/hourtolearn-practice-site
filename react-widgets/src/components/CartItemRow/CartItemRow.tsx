import { QuantityStepper } from '../QuantityStepper/QuantityStepper';
import type { CartItem } from '../../types';

export interface CartItemRowProps {
  item: CartItem;
  onQuantityChange: (id: number, next: number) => void;
  onRemove: (id: number) => void;
  outOfStock?: boolean;
}

export function CartItemRow({ item, onQuantityChange, onRemove, outOfStock }: CartItemRowProps) {
  function handleStepperChange(next: number) {
    // Mirrors cart-store.js's updateQuantity: quantity <= 0 removes the item
    // rather than committing a zero-quantity state.
    if (next <= 0) {
      onRemove(item.id);
      return;
    }
    onQuantityChange(item.id, next);
  }

  return (
    <div className="cart-item-row" data-testid={`cart-item-row-${item.id}`}>
      <span data-testid="cart-item-name">{item.name}</span>
      <span data-testid="cart-item-line-total">${(item.price * item.quantity).toFixed(2)}</span>

      {outOfStock ? (
        <span role="status" aria-label="Out of stock" data-testid="cart-item-out-of-stock">
          Out of stock
        </span>
      ) : null}

      <QuantityStepper quantity={item.quantity} onChange={handleStepperChange} disabled={outOfStock} />

      <button type="button" data-testid="cart-item-remove" onClick={() => onRemove(item.id)}>
        Remove
      </button>
    </div>
  );
}

import { useEffect, useState } from 'react';

export interface QuantityStepperProps {
  quantity: number;
  min?: number;
  max?: number;
  onChange: (next: number) => void;
  disabled?: boolean;
}

export function QuantityStepper({ quantity, min = 1, max = 10, onChange, disabled }: QuantityStepperProps) {
  const [draft, setDraft] = useState(String(quantity));

  // Keep the draft in sync when the committed quantity changes externally
  // (e.g. via the +/- buttons, or a parent updating the prop directly).
  useEffect(() => {
    setDraft(String(quantity));
  }, [quantity]);

  function commit() {
    const parsed = Number(draft);
    // Deliberate simplification vs. the real app's cart.js, which defaults an
    // invalid typed value to 1. Here an invalid draft reverts instead of
    // silently committing a guessed value.
    if (draft.trim() === '' || Number.isNaN(parsed) || !Number.isInteger(parsed)) {
      setDraft(String(quantity));
      return;
    }
    // Mirrors cart-store.js's Math.min(MAX_QTY, quantity) clamp. Values <= 0
    // are intentionally NOT clamped here — CartItemRow treats them as a
    // removal signal, exactly like updateQuantity()'s `quantity <= 0` branch.
    const next = Math.min(parsed, max);
    setDraft(String(next));
    onChange(next);
  }

  return (
    <div className="quantity-stepper">
      <button
        type="button"
        data-testid="qty-decrement"
        disabled={disabled || quantity <= min}
        onClick={() => onChange(quantity - 1)}
      >
        -
      </button>
      <input
        type="text"
        data-testid="qty-input"
        value={draft}
        disabled={disabled}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
      />
      <button
        type="button"
        data-testid="qty-increment"
        disabled={disabled || quantity >= max}
        onClick={() => onChange(quantity + 1)}
      >
        +
      </button>
    </div>
  );
}

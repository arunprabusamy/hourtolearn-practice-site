export type CheckoutState = 'disabled' | 'ready' | 'submitting' | 'failed';

export interface CheckoutButtonProps {
  state: CheckoutState;
  onCheckout: () => void;
}

export function CheckoutButton({ state, onCheckout }: CheckoutButtonProps) {
  return (
    <div data-testid="checkout-button-wrapper">
      <button
        type="button"
        data-testid="checkout-button"
        disabled={state === 'disabled' || state === 'submitting'}
        onClick={onCheckout}
      >
        {state === 'submitting' ? 'Processing...' : 'Checkout'}
      </button>

      {state === 'submitting' ? (
        <span role="status" data-testid="checkout-submitting">
          Processing your order...
        </span>
      ) : null}

      {state === 'failed' ? (
        <span role="alert" data-testid="checkout-failed">
          Checkout failed. Please try again.
        </span>
      ) : null}
    </div>
  );
}

import { test, expect } from '@playwright/experimental-ct-react';
import { CartItemRow } from './CartItemRow';

const baseItem = { id: 1, name: 'Wireless Earbuds Pro', price: 79.99, quantity: 2 };

test('CartItemRow/Default', async ({ mount }) => {
  const component = await mount(
    <CartItemRow item={baseItem} onQuantityChange={() => {}} onRemove={() => {}} />
  );
  await expect(component.getByTestId('cart-item-name')).toHaveText('Wireless Earbuds Pro');
  await expect(component.getByTestId('cart-item-line-total')).toHaveText('$159.98');
});

test('CartItemRow/ZeroQuantity', async ({ mount }) => {
  // The real app's updateQuantity() removes the item entirely when quantity
  // drops to 0 or below — a rendered "quantity: 0" row never exists. This
  // story verifies the removal transition, not a zero-quantity render.
  let removedId: number | null = null;
  const component = await mount(
    <CartItemRow
      item={{ ...baseItem, quantity: 1 }}
      onQuantityChange={() => {}}
      onRemove={(id) => (removedId = id)}
    />
  );

  const input = component.getByTestId('qty-input');
  await input.fill('0');
  await input.blur();

  expect(removedId).toBe(1);
});

test('CartItemRow/OutOfStock', async ({ mount }) => {
  const component = await mount(
    <CartItemRow item={baseItem} onQuantityChange={() => {}} onRemove={() => {}} outOfStock />
  );
  await expect(component.getByTestId('cart-item-out-of-stock')).toHaveAttribute('role', 'status');
  await expect(component.getByTestId('qty-increment')).toBeDisabled();
  await expect(component.getByTestId('qty-decrement')).toBeDisabled();
});

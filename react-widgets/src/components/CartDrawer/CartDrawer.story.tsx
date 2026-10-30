import { test, expect } from '@playwright/experimental-ct-react';
import { CartDrawer } from './CartDrawer';

const items = [
  { id: 1, name: 'Wireless Earbuds Pro', price: 79.99, quantity: 1 },
  { id: 2, name: 'Smart Fitness Watch', price: 129.99, quantity: 2 }
];

test('CartDrawer/Empty', async ({ mount }) => {
  // The empty/loading/error states each render a single root element carrying
  // the data-testid, so assertions target `component` directly — getByTestId()
  // only matches descendants, not the mounted root itself.
  const component = await mount(<CartDrawer items={[]} />);
  await expect(component).toHaveAttribute('data-testid', 'cart-drawer-empty');
  await expect(component).toHaveText('Your cart is empty.');
});

test('CartDrawer/WithItems', async ({ mount }) => {
  const component = await mount(<CartDrawer items={items} />);
  await expect(component.getByTestId('cart-drawer-subtotal')).toHaveText('$339.97');
});

test('CartDrawer/Loading', async ({ mount }) => {
  const component = await mount(<CartDrawer items={[]} loading />);
  await expect(component).toHaveAttribute('role', 'status');
  await expect(component).toHaveAttribute('data-testid', 'cart-drawer-loading');
});

test('CartDrawer/Error', async ({ mount }) => {
  const component = await mount(<CartDrawer items={[]} error="Failed to load cart" />);
  await expect(component).toHaveAttribute('role', 'alert');
  await expect(component).toHaveAttribute('data-testid', 'cart-drawer-error');
  await expect(component).toHaveText('Failed to load cart');
});

test('CartDrawer composed: incrementing a row updates its line total and the subtotal', async ({ mount }) => {
  const component = await mount(<CartDrawer items={items} />);

  const row = component.getByTestId('cart-item-row-2');
  await row.getByTestId('qty-increment').click();

  await expect(row.getByTestId('cart-item-line-total')).toHaveText('$389.97');
  await expect(component.getByTestId('cart-drawer-subtotal')).toHaveText('$469.96');
});

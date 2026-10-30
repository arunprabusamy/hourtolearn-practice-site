import { test, expect } from '@playwright/experimental-ct-react';
import { CheckoutButton } from './CheckoutButton';

test('CheckoutButton/Disabled', async ({ mount }) => {
  const component = await mount(<CheckoutButton state="disabled" onCheckout={() => {}} />);
  await expect(component.getByTestId('checkout-button')).toBeDisabled();
});

test('CheckoutButton/Ready', async ({ mount }) => {
  let clicked = false;
  const component = await mount(<CheckoutButton state="ready" onCheckout={() => (clicked = true)} />);
  await expect(component.getByTestId('checkout-button')).toBeEnabled();
  await component.getByTestId('checkout-button').click();
  expect(clicked).toBe(true);
});

test('CheckoutButton/Submitting', async ({ mount }) => {
  const component = await mount(<CheckoutButton state="submitting" onCheckout={() => {}} />);
  await expect(component.getByTestId('checkout-button')).toBeDisabled();
  await expect(component.getByTestId('checkout-submitting')).toHaveAttribute('role', 'status');
});

test('CheckoutButton/Failed', async ({ mount }) => {
  const component = await mount(<CheckoutButton state="failed" onCheckout={() => {}} />);
  await expect(component.getByTestId('checkout-button')).toBeEnabled();
  await expect(component.getByTestId('checkout-failed')).toHaveAttribute('role', 'alert');
});

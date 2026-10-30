import { test, expect } from '@playwright/experimental-ct-react';
import { QuantityStepper } from './QuantityStepper';

test('QuantityStepper/Default', async ({ mount }) => {
  let lastChange: number | null = null;
  const component = await mount(<QuantityStepper quantity={3} onChange={(next) => (lastChange = next)} />);

  await expect(component.getByTestId('qty-decrement')).toBeEnabled();
  await expect(component.getByTestId('qty-increment')).toBeEnabled();

  await component.getByTestId('qty-increment').click();
  expect(lastChange).toBe(4);
});

test('QuantityStepper/AtMinDisabled', async ({ mount }) => {
  const component = await mount(<QuantityStepper quantity={1} min={1} onChange={() => {}} />);
  await expect(component.getByTestId('qty-decrement')).toBeDisabled();
  await expect(component.getByTestId('qty-increment')).toBeEnabled();
});

test('QuantityStepper/AtMaxDisabled', async ({ mount }) => {
  const component = await mount(<QuantityStepper quantity={10} max={10} onChange={() => {}} />);
  await expect(component.getByTestId('qty-increment')).toBeDisabled();
  await expect(component.getByTestId('qty-decrement')).toBeEnabled();
});

test('QuantityStepper/Invalid', async ({ mount }) => {
  let changeCount = 0;
  const component = await mount(<QuantityStepper quantity={3} onChange={() => (changeCount += 1)} />);

  const input = component.getByTestId('qty-input');
  await input.fill('abc');
  await input.blur();

  await expect(input).toHaveValue('3');
  expect(changeCount).toBe(0);
});

test('QuantityStepper typed input above max clamps to max', async ({ mount }) => {
  // Mirrors cart-store.js's Math.min(MAX_QTY, quantity) clamp — typing a
  // valid but out-of-range integer must not bypass the max boundary.
  let lastChange: number | null = null;
  const component = await mount(
    <QuantityStepper quantity={3} max={10} onChange={(next) => (lastChange = next)} />
  );

  const input = component.getByTestId('qty-input');
  await input.fill('100');
  await input.blur();

  await expect(input).toHaveValue('10');
  expect(lastChange).toBe(10);
});

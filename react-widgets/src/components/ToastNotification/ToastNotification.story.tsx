import { test, expect } from '@playwright/experimental-ct-react';
import { ToastNotification } from './ToastNotification';

test('ToastNotification/Success', async ({ mount }) => {
  const component = await mount(<ToastNotification variant="success" message="Saved successfully." />);
  await expect(component).toHaveAttribute('role', 'status');
  await expect(component.getByTestId('toast-message-text')).toHaveText('Saved successfully.');
});

test('ToastNotification/Error', async ({ mount }) => {
  const component = await mount(<ToastNotification variant="error" message="Something went wrong." />);
  await expect(component).toHaveAttribute('role', 'alert');
});

test('ToastNotification/Info', async ({ mount }) => {
  const component = await mount(<ToastNotification variant="info" message="Heads up." />);
  await expect(component).toHaveAttribute('role', 'status');
});

test('ToastNotification/LongMessageTruncated', async ({ mount }) => {
  const longMessage =
    'This is a very long toast message that should visually truncate instead of wrapping onto multiple lines or overflowing its container.';
  const component = await mount(<ToastNotification variant="info" message={longMessage} />);
  const textEl = component.getByTestId('toast-message-text');

  await expect(textEl).toHaveCSS('text-overflow', 'ellipsis');
  await expect(textEl).toHaveText(longMessage);
  await expect(textEl).toHaveAttribute('title', longMessage);
});

test('ToastNotification close button calls onDismiss', async ({ mount }) => {
  let dismissed = false;
  const component = await mount(
    <ToastNotification variant="info" message="Dismiss me" onDismiss={() => (dismissed = true)} />
  );
  await component.getByTestId('toast-close').click();
  expect(dismissed).toBe(true);
  await expect(component.getByTestId('toast-dismiss-count')).toHaveText('1');
});

test('ToastNotification Escape key calls onDismiss', async ({ mount, page }) => {
  let dismissed = false;
  await mount(<ToastNotification variant="info" message="Dismiss via escape" onDismiss={() => (dismissed = true)} />);
  await page.keyboard.press('Escape');
  expect(dismissed).toBe(true);
});

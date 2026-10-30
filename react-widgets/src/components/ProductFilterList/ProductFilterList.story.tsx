import { test, expect } from '@playwright/experimental-ct-react';
import { ProductFilterList } from './ProductFilterList';
import type { Product } from '../../types';

const products: Product[] = [
  { id: 1, name: 'Wireless Earbuds Pro', price: 79.99, emoji: '🎧', inStock: true },
  { id: 2, name: 'Smart Fitness Watch', price: 129.99, emoji: '⌚', inStock: true },
  { id: 3, name: 'Portable Bluetooth Speaker', price: 49.99, emoji: '🔊', inStock: true }
];

test('ProductFilterList/AllProducts', async ({ mount }) => {
  const component = await mount(<ProductFilterList products={products} onAddToCart={() => {}} />);
  await expect(component.getByTestId('product-1')).toBeVisible();
  await expect(component.getByTestId('product-2')).toBeVisible();
  await expect(component.getByTestId('product-3')).toBeVisible();
});

test('ProductFilterList/FilteredNoMatches', async ({ mount }) => {
  const component = await mount(<ProductFilterList products={products} onAddToCart={() => {}} />);
  await component.getByTestId('product-filter-input').fill('xyz');
  await expect(component.getByTestId('product-filter-no-results')).toHaveAttribute('role', 'status');
});

test('ProductFilterList/FilteredWithMatches', async ({ mount }) => {
  let addedProduct: Product | null = null;
  const component = await mount(
    <ProductFilterList products={products} onAddToCart={(product) => (addedProduct = product)} />
  );

  await component.getByTestId('product-filter-input').fill('wireless');

  await expect(component.getByTestId('product-1')).toBeVisible();
  await expect(component.getByTestId('product-2')).toBeHidden();
  await expect(component.getByTestId('product-3')).toBeHidden();

  await component.getByTestId('add-to-cart-1').click();
  expect(addedProduct).toEqual(products[0]);
});

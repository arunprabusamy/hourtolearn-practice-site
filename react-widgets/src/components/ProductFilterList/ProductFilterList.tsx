import { useState } from 'react';
import type { Product } from '../../types';

export interface ProductFilterListProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

export function ProductFilterList({ products, onAddToCart }: ProductFilterListProps) {
  const [query, setQuery] = useState('');

  const filtered = products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div data-testid="product-filter-list">
      <input
        type="text"
        placeholder="Search products"
        data-testid="product-filter-input"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {filtered.length === 0 ? (
        <p role="status" data-testid="product-filter-no-results">
          No results found
        </p>
      ) : (
        <ul>
          {filtered.map((product) => (
            <li key={product.id} data-testid={`product-${product.id}`}>
              <span>{product.name}</span>
              <button type="button" data-testid={`add-to-cart-${product.id}`} onClick={() => onAddToCart(product)}>
                Add
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

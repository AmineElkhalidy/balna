import { useCallback, useState } from "react";
import {
  AUDIENCES,
  CATEGORIES,
  DEFAULT_SORT,
  SORT_KEYS,
  type Audience,
  type Category,
  type QuizFilter,
  type SortKey,
} from "./catalog";

/**
 * Single source of truth for the catalog screen's filter selection.
 *
 * On the web this state lives in `searchParams` so URLs are shareable; on
 * mobile we use plain React state (deep-linkable equivalents could be added
 * later via Expo Router's `useLocalSearchParams`, but for v1 we keep the UX
 * focused and avoid deep-linking complexity).
 *
 * The shape matches `QuizFilter` so the same `getProducts(filter)` function
 * services both surfaces.
 */
export function useCatalogFilter(initial: Partial<QuizFilter> = {}) {
  const [filter, setFilter] = useState<QuizFilter>({
    audience: pick(initial.audience, AUDIENCES),
    category: pick(initial.category, CATEGORIES),
    brands: initial.brands ?? [],
    sizes: initial.sizes ?? [],
    sort: pick(initial.sort, SORT_KEYS) ?? DEFAULT_SORT,
  });

  const setAudience = useCallback((next: Audience | null) => {
    setFilter((p) => ({ ...p, audience: next ?? undefined }));
  }, []);

  const setCategory = useCallback((next: Category | null) => {
    setFilter((p) => ({ ...p, category: next ?? undefined }));
  }, []);

  const setSort = useCallback((next: SortKey) => {
    setFilter((p) => ({ ...p, sort: next }));
  }, []);

  const setBrands = useCallback((next: readonly string[]) => {
    setFilter((p) => ({ ...p, brands: next }));
  }, []);

  const setSizes = useCallback((next: readonly string[]) => {
    setFilter((p) => ({ ...p, sizes: next }));
  }, []);

  const reset = useCallback(() => {
    setFilter({
      audience: undefined,
      category: undefined,
      brands: [],
      sizes: [],
      sort: DEFAULT_SORT,
    });
  }, []);

  const isFiltered = Boolean(
    filter.audience ||
      filter.category ||
      (filter.brands && filter.brands.length > 0) ||
      (filter.sizes && filter.sizes.length > 0),
  );

  return {
    filter,
    isFiltered,
    setAudience,
    setCategory,
    setSort,
    setBrands,
    setSizes,
    reset,
  };
}

function pick<T extends string>(
  v: T | undefined,
  allowed: readonly T[],
): T | undefined {
  if (!v) return undefined;
  return (allowed as readonly string[]).includes(v) ? v : undefined;
}

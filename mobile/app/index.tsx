import { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  FlatList,
  Text,
  RefreshControl,
  StyleSheet,
  Platform,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header } from "@/components/Header";
import { CategoryFilter } from "@/components/CategoryFilter";
import { SortPicker } from "@/components/SortPicker";
import { ProductCard } from "@/components/ProductCard";
import { ProductCardSkeleton } from "@/components/ProductCardSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { useDict } from "@/lib/i18n/LocaleContext";
import { format } from "@/lib/i18n";
import {
  AUDIENCES,
  CATEGORIES,
  SORT_KEYS,
  type Audience,
  type Category,
  type Product,
  type SortKey,
} from "@/lib/catalog";
import { useCatalogFilter } from "@/lib/useCatalogFilter";
import { useResponsive } from "@/lib/useResponsive";
import {
  getProducts,
  getSiteSettings,
  type SiteSettings,
} from "@/lib/sanity/products";

/**
 * Catalog (home) — the store. Mirrors the web's `app/[lang]/page.tsx`:
 * sticky brand header with audience tabs, sticky filter bar (category
 * chips + sort), then a 2-column scrollable product grid.
 *
 * The quiz hands off here via deep-link query params (e.g. `/?for=men`).
 * On screen-mount we read those once into the filter state; subsequent
 * filter changes happen in-memory (the URL is just a bootstrap channel).
 */
export default function CatalogScreen() {
  const dict = useDict();
  const r = useResponsive();
  const params = useLocalSearchParams<{
    for?: string;
    type?: string;
    size?: string;
    brand?: string;
    sort?: string;
  }>();

  const initial = {
    audience: pick(params.for, AUDIENCES) as Audience | undefined,
    category: pick(params.type, CATEGORIES) as Category | undefined,
    sizes: split(params.size),
    brands: split(params.brand),
    sort: pick(params.sort, SORT_KEYS) as SortKey | undefined,
  };

  const {
    filter,
    isFiltered,
    setAudience,
    setCategory,
    setSort,
    reset,
  } = useCatalogFilter(initial);

  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [ps, s] = await Promise.all([
        getProducts(filter),
        getSiteSettings(),
      ]);
      setProducts(ps);
      setSettings(s);
    } catch (err) {
      console.warn("[catalog] load failed:", err);
      setProducts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  useEffect(() => {
    setLoading(true);
    void load();
  }, [load]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    void load();
  }, [load]);

  // Stable renderItem so FlatList's recycler doesn't tear down rows on
  // every parent re-render. Only re-creates when `settings` changes,
  // which is rare (just the initial fetch).
  const renderItem = useCallback(
    ({ item }: { item: Product }) => (
      <View style={{ flex: 1 }}>
        <ProductCard product={item} settings={settings} />
      </View>
    ),
    [settings],
  );

  return (
    <SafeAreaView style={styles.flex} edges={["top"]}>
      <Header
        variant="catalog"
        selectedAudience={filter.audience ?? null}
        onAudienceChange={setAudience}
      />

      <View
        style={[
          styles.filterBar,
          {
            paddingTop: r.scale(12),
            paddingBottom: r.scale(12),
            gap: r.scale(12),
          },
        ]}
      >
        <View
          style={[styles.filterTopRow, { paddingHorizontal: r.pageGutter }]}
        >
          <Text style={[styles.count, { fontSize: r.scale(13) }]}>
            {format(dict.home.stockCount, { count: products.length })}
          </Text>
          <SortPicker value={filter.sort ?? "newest"} onChange={setSort} />
        </View>
        <CategoryFilter
          selected={filter.category ?? null}
          onChange={setCategory}
        />
      </View>

      {loading ? (
        <SkeletonGrid columns={r.gridColumns} />
      ) : products.length === 0 ? (
        <EmptyState
          isFiltered={isFiltered}
          settings={settings}
          onClear={reset}
        />
      ) : (
        <FlatList
          // `numColumns` can't be changed without a remount — keying the
          // list on the column count makes rotations / window-size changes
          // (foldables, split-screen) safe.
          key={`grid-${r.gridColumns}`}
          data={products}
          keyExtractor={(p) => p.id}
          numColumns={r.gridColumns}
          columnWrapperStyle={{ gap: r.gridGap }}
          contentContainerStyle={{
            padding: r.pageGutter,
            paddingBottom: r.scale(32),
          }}
          ItemSeparatorComponent={() => <View style={{ height: r.gridGap }} />}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#11b79f"
              colors={["#11b79f"]}
            />
          }
          showsVerticalScrollIndicator={false}
          // ── Performance tuning ─────────────────────────────────────────
          // For 12 demo items these are no-ops, but they kick in the
          // moment the catalog grows past one screen-full:
          //   • removeClippedSubviews — recycles offscreen views (Android only)
          //   • windowSize=5 — render ~5 viewport-heights on either side
          //   • initialNumToRender — first ~4 rows = paint quickly (cols-aware)
          //   • maxToRenderPerBatch — chunk subsequent batches (cols-aware)
          //   • updateCellsBatchingPeriod=70 — coalesce updates on scroll
          removeClippedSubviews={Platform.OS === "android"}
          windowSize={5}
          initialNumToRender={r.gridColumns * 4}
          maxToRenderPerBatch={r.gridColumns * 4}
          updateCellsBatchingPeriod={70}
        />
      )}
    </SafeAreaView>
  );
}

/* ─── Render helpers ────────────────────────────────────────────────────── */

const renderSkeletonRow = () => (
  <View style={{ flex: 1 }}>
    <ProductCardSkeleton />
  </View>
);

/**
 * Skeleton grid shown during the initial Sanity fetch. Renders exactly 4
 * rows for whatever column count the parent screen is using, which is
 * enough to fill any viewport without over-rendering offscreen nodes.
 */
function SkeletonGrid({ columns }: { columns: number }) {
  const r = useResponsive();
  const items = useMemo(
    () =>
      Array.from({ length: columns * 4 }, (_, i) => `sk-${i}`),
    [columns],
  );
  return (
    <FlatList
      key={`skel-${columns}`}
      data={items}
      keyExtractor={(id) => id}
      numColumns={columns}
      columnWrapperStyle={{ gap: r.gridGap }}
      contentContainerStyle={{
        padding: r.pageGutter,
        paddingBottom: r.scale(32),
      }}
      ItemSeparatorComponent={() => <View style={{ height: r.gridGap }} />}
      renderItem={renderSkeletonRow}
      scrollEnabled={false}
      showsVerticalScrollIndicator={false}
    />
  );
}

/* ─── Helpers ───────────────────────────────────────────────────────────── */

function pick<T extends string>(
  v: string | string[] | undefined,
  allowed: readonly T[],
): T | undefined {
  const value = Array.isArray(v) ? v[0] : v;
  if (!value) return undefined;
  return (allowed as readonly string[]).includes(value)
    ? (value as T)
    : undefined;
}

function split(v: string | string[] | undefined): string[] {
  const raw = typeof v === "string" ? v : "";
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: "#fbf9f5",
  },
  // `paddingTop`, `paddingBottom`, `gap` are overridden inline by the
  // catalog screen so the filter bar can scale with the responsive hook.
  filterBar: {
    backgroundColor: "#fbf9f5",
    borderBottomColor: "#e7e3d8",
    borderBottomWidth: 1,
  },
  filterTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  count: {
    fontFamily: "PlusJakartaSans_700Bold",
    color: "#0d1126",
    includeFontPadding: false,
  },
});

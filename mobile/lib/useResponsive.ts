import { useMemo } from "react";
import { useWindowDimensions } from "react-native";

/**
 * Single source of truth for responsive layout decisions across the
 * mobile app. Wraps `useWindowDimensions` so every component automatically
 * re-renders on rotation / split-screen / foldable hinge changes.
 *
 * Breakpoints are in **density-independent pixels** (the same units RN
 * style props use), not raw screen pixels:
 *
 *   compact  …  width <  360   (small Androids: Galaxy S5, iPhone SE 1)
 *   phone    …  360 ≤ w < 600  (vast majority of phones)
 *   tablet   …  600 ≤ w < 960  (small tablets, landscape phones, foldables)
 *   wide     …  960 ≤ w        (tablets in landscape, Chromebooks, web)
 *
 * Usage:
 *   const r = useResponsive();
 *   const cols = r.gridColumns;          // 2 / 3 / 4
 *   const gutter = r.pageGutter;         // 16 / 20 / 24
 *   const fs = r.scale(13);              // proportional font size
 *   if (r.isTablet) { … }                // tablet branch
 *
 * Notes:
 *   - `scale` is *clamped* (0.9 ↔ 1.2) so tablets don't get monstrous text
 *     and tiny phones don't get illegible text. It scales relative to a
 *     375 dp baseline (iPhone 11 / Pixel 5 width).
 *   - Keep this hook cheap: don't add image-density or pixel-ratio logic
 *     here unless multiple components need it. Components that need the
 *     PixelRatio can call `PixelRatio.get()` themselves.
 */
export interface Responsive {
  /** Width in dp (density-independent pixels). */
  width: number;
  /** Height in dp. */
  height: number;
  /** Base size for proportional `scale()` calls. */
  baseWidth: number;

  // Coarse buckets — prefer these to raw width comparisons in components.
  isCompact: boolean;
  isPhone: boolean;
  isTablet: boolean;
  isWide: boolean;
  isLandscape: boolean;

  /** Recommended product-grid column count. */
  gridColumns: number;
  /** Recommended quiz tile column count. */
  quizColumns: number;
  /** Outer page padding in dp. */
  pageGutter: number;
  /** Card-grid gap in dp. */
  gridGap: number;
  /** Max width modal sheets should expand to (centered if wider). */
  modalMaxWidth: number;
  /** Max width hero/empty-state cards should expand to. */
  contentMaxWidth: number;

  /** Proportional scaler for font sizes & spacing. Clamped 0.9–1.2. */
  scale: (n: number) => number;
}

const BASE_WIDTH = 375; // iPhone 11 / Pixel 5 — our design reference.
const SCALE_MIN = 0.9;
const SCALE_MAX = 1.2;

export function useResponsive(): Responsive {
  const { width, height } = useWindowDimensions();

  return useMemo<Responsive>(() => {
    const isLandscape = width > height;
    const isCompact = width < 360;
    const isPhone = width >= 360 && width < 600;
    const isTablet = width >= 600 && width < 960;
    const isWide = width >= 960;

    // Linear scale clamped to [SCALE_MIN, SCALE_MAX]. We scale by min(width,
    // height) so that landscape phones don't suddenly pump up font sizes.
    const ref = Math.min(width, height || width);
    const raw = ref / BASE_WIDTH;
    const factor = Math.min(SCALE_MAX, Math.max(SCALE_MIN, raw));

    const scale = (n: number) => Math.round(n * factor * 10) / 10;

    const gridColumns = isWide ? 4 : isTablet ? 3 : 2;
    const quizColumns = isWide ? 4 : isTablet ? 3 : 2;
    const pageGutter = isWide ? 28 : isTablet ? 24 : isCompact ? 12 : 16;
    const gridGap = isTablet || isWide ? 16 : 12;
    const modalMaxWidth = 560;
    const contentMaxWidth = 640;

    return {
      width,
      height,
      baseWidth: BASE_WIDTH,
      isCompact,
      isPhone,
      isTablet,
      isWide,
      isLandscape,
      gridColumns,
      quizColumns,
      pageGutter,
      gridGap,
      modalMaxWidth,
      contentMaxWidth,
      scale,
    };
  }, [width, height]);
}

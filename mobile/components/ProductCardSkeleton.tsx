import { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useResponsive } from "@/lib/useResponsive";

/**
 * Loading-state stand-in for {@link ProductCard}. Matches the real card's
 * dimensions and corner-radius so when real data arrives the layout
 * doesn't reflow visibly — only the placeholder boxes get replaced.
 *
 * Uses Reanimated 4 (already a dep for `expo-router`) to drive a soft
 * left-to-right shimmer via `opacity` instead of a `LinearGradient`. That
 * keeps the bundle dep-free and runs on the UI thread.
 */
export function ProductCardSkeleton() {
  const r = useResponsive();
  const opacity = useSharedValue(0.55);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, {
        duration: 850,
        easing: Easing.inOut(Easing.quad),
      }),
      -1, // infinite
      true, // reverse on each cycle → 0.55 ↔ 1.0
    );
  }, [opacity]);

  const animated = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <View style={styles.card}>
      <Animated.View style={[styles.thumb, animated]} />
      <View style={[styles.body, { padding: r.scale(12) }]}>
        <Animated.View
          style={[styles.line, styles.brandLine, { height: r.scale(8) }, animated]}
        />
        <Animated.View
          style={[
            styles.line,
            styles.titleLine1,
            { height: r.scale(12) },
            animated,
          ]}
        />
        <Animated.View
          style={[
            styles.line,
            styles.titleLine2,
            { height: r.scale(12) },
            animated,
          ]}
        />
        <Animated.View
          style={[
            styles.line,
            styles.priceLine,
            { height: r.scale(14) },
            animated,
          ]}
        />
      </View>
    </View>
  );
}

// ── Styles mirror ProductCard: same border radius, padding, gap so the
//    layout doesn't shift when real data swaps in. ─────────────────────────
const SKELETON_BG = "#eceadc"; // a touch darker than #fbf9f5 page bg
const PILL = 999;

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e7e3d8",
    overflow: "hidden",
  },
  thumb: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: SKELETON_BG,
  },
  // `padding` set inline (driven by useResponsive).
  body: {
    gap: 6,
  },
  line: {
    backgroundColor: SKELETON_BG,
    borderRadius: PILL,
  },
  // `height` for each line is set inline (driven by useResponsive).
  brandLine: {
    width: "35%",
    marginBottom: 2,
  },
  titleLine1: {
    width: "85%",
  },
  titleLine2: {
    width: "60%",
  },
  priceLine: {
    width: "40%",
    marginTop: 6,
  },
});

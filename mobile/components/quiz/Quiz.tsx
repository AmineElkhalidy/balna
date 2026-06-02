import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { useDict } from "@/lib/i18n/LocaleContext";
import { format } from "@/lib/i18n";
import {
  ACCESSORIES_SIZE,
  AUDIENCES,
  AUDIENCE_EMOJI,
  CATEGORIES,
  CATEGORY_EMOJI,
  SIZES_BY_AUDIENCE,
  type Audience,
  type Category,
} from "@/lib/catalog";
import { getBrandIndex, type BrandIndex } from "@/lib/sanity/products";
import { useResponsive } from "@/lib/useResponsive";
import { Ionicon } from "@/components/icons/Ionicon";

type Step = "audience" | "category" | "brand" | "size";
const TOTAL = 4;
const ORDER: Step[] = ["audience", "category", "brand", "size"];

/**
 * 4-step quick-find wizard. Mirrors the web's `app/components/Quiz.tsx`
 * but with native transitions (slide between steps via opacity/translate)
 * and a native progress bar.
 *
 * On submit, navigates back to `/` with the picked filters as URL params
 * — the catalog screen reads them on mount and renders the curated grid.
 */
export function Quiz() {
  const dict = useDict();
  const router = useRouter();
  const r = useResponsive();

  const [step, setStep] = useState<Step>("audience");
  const [audience, setAudience] = useState<Audience | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [brands, setBrands] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);

  const [brandIndex, setBrandIndex] = useState<BrandIndex | null>(null);
  const [loadingBrands, setLoadingBrands] = useState(true);

  // Quiz tiles render N-up. Keeping the column count separate from the
  // catalog grid so it can stay 2 on landscape phones (where products go
  // 3-up). Quiz tiles look better with breathing room.
  const tileColumns = r.isWide ? 4 : r.isTablet ? 3 : 2;

  // Brands are loaded once and cached for the rest of the flow.
  useEffect(() => {
    let alive = true;
    getBrandIndex()
      .then((idx) => {
        if (alive) setBrandIndex(idx);
      })
      .catch((err) => console.warn("[quiz] brand index failed:", err))
      .finally(() => alive && setLoadingBrands(false));
    return () => {
      alive = false;
    };
  }, []);

  const stepIndex = ORDER.indexOf(step);
  const stepNumber = stepIndex + 1;

  const goNext = (next: Step) => setStep(next);
  const goBack = () => {
    const i = stepIndex;
    if (i <= 0) {
      router.back();
      return;
    }
    setStep(ORDER[i - 1]!);
  };

  function submit() {
    if (!audience || !category) return;
    const params: Record<string, string> = { for: audience, type: category };
    if (brands.length) params.brand = brands.join(",");
    if (sizes.length) params.size = sizes.join(",");
    router.replace({ pathname: "/", params });
  }

  function skipToAll() {
    if (!audience) return;
    router.replace({ pathname: "/", params: { for: audience } });
  }

  /* ── Step bodies ─────────────────────────────────────────────────────── */

  const audienceStep = (
    <StepFrame
      eyebrow={format(dict.quiz.stepLabel, { step: stepNumber, total: TOTAL })}
      title={dict.quiz.audience.title}
      subtitle={dict.quiz.audience.subtitle}
      progress={stepNumber / TOTAL}
    >
      <View style={styles.tileGrid}>
        {AUDIENCES.map((a) => (
          <BigTile
            key={a}
            label={dict.audience[a]}
            emoji={AUDIENCE_EMOJI[a]}
            active={audience === a}
            columns={tileColumns}
            onPress={() => {
              setAudience(a);
              goNext("category");
            }}
          />
        ))}
      </View>
    </StepFrame>
  );

  const categoryStep = (
    <StepFrame
      eyebrow={format(dict.quiz.stepLabel, { step: stepNumber, total: TOTAL })}
      title={dict.quiz.category.title}
      subtitle={dict.quiz.category.subtitle}
      progress={stepNumber / TOTAL}
      onBack={goBack}
    >
      <View style={styles.tileGrid}>
        {CATEGORIES.map((c) => (
          <BigTile
            key={c}
            label={dict.category[c]}
            emoji={CATEGORY_EMOJI[c]}
            active={category === c}
            columns={tileColumns}
            onPress={() => {
              setCategory(c);
              goNext("brand");
            }}
          />
        ))}
      </View>
      <SkipRow label={dict.quiz.skipToAll} onPress={skipToAll} />
    </StepFrame>
  );

  const availableBrands = useMemo(() => {
    if (!audience || !category || !brandIndex) return [];
    return brandIndex[`${audience}:${category}`] ?? [];
  }, [audience, category, brandIndex]);

  const brandStep = (
    <StepFrame
      eyebrow={format(dict.quiz.stepLabel, { step: stepNumber, total: TOTAL })}
      title={dict.quiz.brand.title}
      subtitle={dict.quiz.brand.subtitle}
      progress={stepNumber / TOTAL}
      onBack={goBack}
    >
      {loadingBrands ? (
        <ActivityIndicator color="#11b79f" style={{ marginVertical: 24 }} />
      ) : availableBrands.length === 0 ? (
        <View style={styles.brandEmpty}>
          <Text style={styles.brandEmptyTitle}>
            {dict.quiz.brand.empty.title}
          </Text>
          <Text style={styles.brandEmptyBody}>
            {dict.quiz.brand.empty.body}
          </Text>
          <Pressable
            onPress={() => goNext("size")}
            style={styles.btnPrimary}
          >
            <Text style={styles.btnPrimaryText}>
              {dict.quiz.brand.empty.cta}
            </Text>
          </Pressable>
        </View>
      ) : (
        <>
          <View style={styles.chipWrap}>
            {availableBrands.map((b) => {
              const active = brands.includes(b);
              return (
                <Pressable
                  key={b}
                  onPress={() =>
                    setBrands((prev) =>
                      prev.includes(b)
                        ? prev.filter((x) => x !== b)
                        : [...prev, b],
                    )
                  }
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      active && styles.chipTextActive,
                    ]}
                  >
                    {b}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={styles.helper}>
            {brands.length
              ? format(dict.quiz.brand.selectionHint, {
                  count: brands.length,
                })
              : dict.quiz.brand.noneSelectedHint}
          </Text>
          <View style={styles.actionRow}>
            <Pressable
              onPress={() => {
                setBrands([]);
                goNext("size");
              }}
              style={styles.btnSecondary}
            >
              <Text style={styles.btnSecondaryText}>{dict.quiz.brand.skip}</Text>
            </Pressable>
            <Pressable
              onPress={() => goNext("size")}
              style={styles.btnPrimary}
            >
              <Text style={styles.btnPrimaryText}>
                {dict.quiz.brand.continue}
              </Text>
            </Pressable>
          </View>
        </>
      )}
    </StepFrame>
  );

  const isAccessory = category === "accessories";
  const sizeOptions = isAccessory
    ? [ACCESSORIES_SIZE]
    : audience
      ? SIZES_BY_AUDIENCE[audience]
      : [];

  const sizeStep = (
    <StepFrame
      eyebrow={format(dict.quiz.stepLabel, { step: stepNumber, total: TOTAL })}
      title={dict.quiz.size.title}
      subtitle={
        isAccessory
          ? dict.quiz.size.subtitleAccessories
          : dict.quiz.size.subtitle
      }
      progress={stepNumber / TOTAL}
      onBack={goBack}
    >
      <View style={styles.chipWrap}>
        {sizeOptions.map((s) => {
          const active = sizes.includes(s);
          return (
            <Pressable
              key={s}
              onPress={() =>
                setSizes((prev) =>
                  prev.includes(s)
                    ? prev.filter((x) => x !== s)
                    : [...prev, s],
                )
              }
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text
                style={[styles.chipText, active && styles.chipTextActive]}
              >
                {s}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.helper}>
        {format(dict.quiz.size.skipHint, { cta: dict.quiz.skipToAll })}
      </Text>
      <View style={styles.actionRow}>
        <Pressable onPress={skipToAll} style={styles.btnSecondary}>
          <Text style={styles.btnSecondaryText}>{dict.quiz.skipToAll}</Text>
        </Pressable>
        <Pressable onPress={submit} style={styles.btnPrimary}>
          <Text style={styles.btnPrimaryText}>{dict.quiz.size.submit}</Text>
        </Pressable>
      </View>
    </StepFrame>
  );

  switch (step) {
    case "audience":
      return audienceStep;
    case "category":
      return categoryStep;
    case "brand":
      return brandStep;
    case "size":
      return sizeStep;
  }
}

/* ─── Sub-components ────────────────────────────────────────────────────── */

function StepFrame({
  eyebrow,
  title,
  subtitle,
  progress,
  onBack,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  progress: number;
  onBack?: () => void;
  children: React.ReactNode;
}) {
  const dict = useDict();
  const r = useResponsive();
  return (
    <ScrollView
      contentContainerStyle={{
        padding: r.pageGutter,
        paddingBottom: r.scale(40),
        gap: r.scale(16),
        // Keep the form column readable on tablets — when the screen is
        // wider than the content cap, centre the column instead of
        // stretching it.
        maxWidth: r.contentMaxWidth,
        width: "100%",
        alignSelf: "center",
      }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.progressOuter}>
        <View
          style={[
            styles.progressInner,
            { width: `${Math.min(100, Math.max(0, progress * 100))}%` },
          ]}
        />
      </View>

      <View style={{ gap: 6 }}>
        <Text style={[styles.eyebrow, { fontSize: r.scale(11) }]}>
          {eyebrow}
        </Text>
        <Text style={[styles.title, { fontSize: r.scale(26) }]}>{title}</Text>
        <Text
          style={[
            styles.subtitle,
            { fontSize: r.scale(14.5), lineHeight: r.scale(22) },
          ]}
        >
          {subtitle}
        </Text>
      </View>

      {children}

      {onBack ? (
        <Pressable
          onPress={onBack}
          accessibilityRole="link"
          style={({ pressed }) => ({
            alignSelf: "flex-start",
            marginTop: 8,
            paddingVertical: 6,
            paddingHorizontal: 4,
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <Text style={styles.backLink}>{dict.quiz.back}</Text>
        </Pressable>
      ) : null}
    </ScrollView>
  );
}

function BigTile({
  label,
  emoji,
  active,
  columns,
  onPress,
}: {
  label: string;
  emoji: string;
  active: boolean;
  /** How many tiles per row on this screen size — drives the flexBasis. */
  columns: number;
  onPress: () => void;
}) {
  // Subtract a little so `gap: 12` doesn't push the last column to wrap.
  // Result rounds to ~47 / 31 / 23 % for 2 / 3 / 4 columns.
  const flexBasis = `${Math.floor(100 / columns) - 3}%` as const;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={({ pressed }) => [
        styles.tile,
        { flexBasis },
        active && styles.tileActive,
        !active && pressed && { backgroundColor: "#f3efe5" },
      ]}
    >
      <Text style={styles.tileEmoji}>{emoji}</Text>
      <Text style={[styles.tileLabel, active && styles.tileLabelActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

function SkipRow({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="link"
      style={({ pressed }) => ({
        alignSelf: "center",
        marginTop: 4,
        paddingVertical: 8,
        paddingHorizontal: 14,
        opacity: pressed ? 0.6 : 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
      })}
    >
      <Text style={styles.skipText}>{label}</Text>
      <Ionicon name="arrow-forward" size={14} color="#0c9281" />
    </Pressable>
  );
}

/* ─── Styles ────────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  progressOuter: {
    height: 6,
    backgroundColor: "#e7e3d8",
    borderRadius: 999,
    overflow: "hidden",
  },
  progressInner: {
    height: "100%",
    backgroundColor: "#11b79f",
    borderRadius: 999,
  },
  // `fontSize` set inline (driven by useResponsive).
  eyebrow: {
    fontFamily: "PlusJakartaSans_700Bold",
    letterSpacing: 1.4,
    textTransform: "uppercase",
    color: "#0c9281",
    includeFontPadding: false,
  },
  title: {
    fontFamily: "PlusJakartaSans_800ExtraBold",
    color: "#0d1126",
    includeFontPadding: false,
  },
  subtitle: {
    fontFamily: "PlusJakartaSans_500Medium",
    color: "#5b6379",
    includeFontPadding: false,
  },
  tileGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  // `flexBasis` set inline (driven by tileColumns).
  tile: {
    flexGrow: 1,
    aspectRatio: 1.2,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e7e3d8",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  tileActive: {
    backgroundColor: "#e9f8f4",
    borderColor: "#11b79f",
  },
  tileEmoji: {
    fontSize: 42,
  },
  tileLabel: {
    fontFamily: "PlusJakartaSans_700Bold",
    fontSize: 15,
    color: "#0d1126",
    includeFontPadding: false,
  },
  tileLabelActive: {
    color: "#0c9281",
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#e7e3d8",
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  chipActive: {
    borderColor: "#0d1126",
    backgroundColor: "#0d1126",
  },
  chipText: {
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontSize: 13.5,
    color: "#0d1126",
    includeFontPadding: false,
  },
  chipTextActive: {
    color: "#ffffff",
  },
  helper: {
    fontFamily: "PlusJakartaSans_500Medium",
    fontSize: 12.5,
    color: "#5b6379",
    includeFontPadding: false,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  btnPrimary: {
    flex: 1,
    height: 52,
    borderRadius: 999,
    backgroundColor: "#0d1126",
    alignItems: "center",
    justifyContent: "center",
  },
  btnPrimaryText: {
    fontFamily: "PlusJakartaSans_700Bold",
    fontSize: 14.5,
    color: "#ffffff",
    includeFontPadding: false,
  },
  btnSecondary: {
    flex: 1,
    height: 52,
    borderRadius: 999,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e7e3d8",
    alignItems: "center",
    justifyContent: "center",
  },
  btnSecondaryText: {
    fontFamily: "PlusJakartaSans_700Bold",
    fontSize: 14,
    color: "#0d1126",
    includeFontPadding: false,
  },
  brandEmpty: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#e7e3d8",
    gap: 10,
  },
  brandEmptyTitle: {
    fontFamily: "PlusJakartaSans_700Bold",
    fontSize: 15,
    color: "#0d1126",
    includeFontPadding: false,
  },
  brandEmptyBody: {
    fontFamily: "PlusJakartaSans_500Medium",
    fontSize: 13,
    color: "#5b6379",
    lineHeight: 19,
    includeFontPadding: false,
  },
  backLink: {
    fontFamily: "PlusJakartaSans_700Bold",
    fontSize: 13,
    color: "#5b6379",
    includeFontPadding: false,
  },
  skipText: {
    fontFamily: "PlusJakartaSans_700Bold",
    fontSize: 13,
    color: "#0c9281",
    includeFontPadding: false,
  },
});

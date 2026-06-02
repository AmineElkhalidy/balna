import { useState } from "react";
import {
  Modal,
  Pressable,
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useDict } from "@/lib/i18n/LocaleContext";
import { useResponsive } from "@/lib/useResponsive";
import { SORT_KEYS, type SortKey } from "@/lib/catalog";
import { Ionicon } from "./icons/Ionicon";

interface SortPickerProps {
  value: SortKey;
  onChange: (next: SortKey) => void;
}

/**
 * Pressable label that opens a centred modal sheet listing all sort
 * options. Native-feeling on Android (no JS dropdown weirdness, no
 * scroll-jacking) and a11y-friendly out of the box because each option
 * is a real `TouchableOpacity` with role=radio semantics.
 */
export function SortPicker({ value, onChange }: SortPickerProps) {
  const [open, setOpen] = useState(false);
  const dict = useDict();
  const r = useResponsive();
  const currentLabel = dict.sort[value];

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`${dict.home.sortBy}: ${currentLabel}`}
        style={({ pressed }) => ({
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          height: 36,
          paddingHorizontal: 14,
          borderRadius: 999,
          borderWidth: 1,
          borderColor: "#e7e3d8",
          backgroundColor: pressed ? "#f3efe5" : "#ffffff",
        })}
      >
        <Text
          style={{
            fontFamily: "PlusJakartaSans_700Bold",
            fontSize: 13,
            color: "#0d1126",
            includeFontPadding: false,
          }}
        >
          {currentLabel}
        </Text>
        <Ionicon name="chevron-down" size={14} color="#5b6379" />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          style={styles.backdrop}
          onPress={() => setOpen(false)}
          accessibilityLabel={dict.checkout.close}
        >
          <Pressable
            // Inner Pressable with no onPress just absorbs taps so they
            // don't reach the backdrop and dismiss the modal accidentally.
            onPress={() => {}}
            style={[styles.sheet, { maxWidth: r.modalMaxWidth }]}
          >
            <Text style={styles.title}>{dict.home.sortBy}</Text>
            {SORT_KEYS.map((k) => {
              const active = k === value;
              return (
                <TouchableOpacity
                  key={k}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                  style={[styles.row, active && styles.rowActive]}
                  onPress={() => {
                    onChange(k);
                    setOpen(false);
                  }}
                >
                  <Text
                    style={[styles.rowLabel, active && styles.rowLabelActive]}
                  >
                    {dict.sort[k]}
                  </Text>
                  {active ? (
                    <Ionicon name="checkmark" size={18} color="#0c9281" />
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(13,17,38,0.45)",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  sheet: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 12,
    gap: 4,
  },
  title: {
    fontFamily: "PlusJakartaSans_700Bold",
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    color: "#5b6379",
    paddingHorizontal: 12,
    paddingVertical: 8,
    includeFontPadding: false,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRadius: 14,
  },
  rowActive: {
    backgroundColor: "#e9f8f4",
  },
  rowLabel: {
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontSize: 15,
    color: "#0d1126",
    includeFontPadding: false,
  },
  rowLabelActive: {
    fontFamily: "PlusJakartaSans_700Bold",
    color: "#0c9281",
  },
});

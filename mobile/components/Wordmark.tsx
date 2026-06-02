import { View, Text, StyleSheet } from "react-native";

interface WordmarkProps {
  size?: "sm" | "md" | "lg";
}

/**
 * "Minor Shop" wordmark with the dotless ı + tiny clothes-hanger tittle —
 * same identity as the web. The whole mark is forced LTR with
 * `writingDirection: "ltr"` so it never bidi-flips on Arabic screens.
 */
export function Wordmark({ size = "md" }: WordmarkProps) {
  const fontSize = size === "sm" ? 18 : size === "lg" ? 36 : 22;
  return (
    <View style={styles.row}>
      <Text style={[styles.text, { fontSize, color: "#11b79f" }]}>M</Text>
      <View style={{ position: "relative" }}>
        <Text style={[styles.text, { fontSize, color: "#11b79f" }]}>ı</Text>
        <View style={[styles.tag, { top: -fontSize * 0.18 }]}>
          <View style={styles.hook} />
          <View style={styles.bar} />
        </View>
      </View>
      <Text style={[styles.text, { fontSize, color: "#11b79f" }]}>nor</Text>
      <Text style={[styles.text, { fontSize, color: "#1a2a52" }]}> Shop</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "baseline",
    // Force LTR so the wordmark always reads "Minor Shop" — even on the AR
    // screen where the rest of the UI is flipped.
    writingDirection: "ltr",
  },
  text: {
    fontFamily: "PlusJakartaSans_800ExtraBold",
    letterSpacing: -0.6,
    includeFontPadding: false,
  },
  tag: {
    position: "absolute",
    left: "50%",
    transform: [{ translateX: -3 }],
    alignItems: "center",
  },
  hook: {
    width: 1.6,
    height: 5,
    borderRadius: 1,
    backgroundColor: "#11b79f",
    transform: [{ rotate: "20deg" }],
  },
  bar: {
    width: 6,
    height: 1.4,
    backgroundColor: "#11b79f",
    borderRadius: 1,
    marginTop: -0.5,
  },
});

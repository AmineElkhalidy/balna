import { View, Text, StyleSheet } from "react-native";
import { Link, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NotFound() {
  return (
    <SafeAreaView style={styles.wrap} edges={["top"]}>
      <Stack.Screen options={{ title: "Not found" }} />
      <Text style={styles.title}>Page not found</Text>
      <Link href="/" style={styles.link}>
        Go to the catalog
      </Link>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: "#fbf9f5",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 16,
  },
  title: {
    fontFamily: "PlusJakartaSans_800ExtraBold",
    fontSize: 22,
    color: "#0d1126",
    includeFontPadding: false,
  },
  link: {
    fontFamily: "PlusJakartaSans_700Bold",
    fontSize: 14,
    color: "#0c9281",
    includeFontPadding: false,
  },
});

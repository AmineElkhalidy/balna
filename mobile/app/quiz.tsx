import { View, Text, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Header } from "@/components/Header";
import { Quiz } from "@/components/quiz/Quiz";
import { useDict } from "@/lib/i18n/LocaleContext";

/**
 * Quick-find route. Reachable from the catalog header (✨ Quick find pill).
 * Submitting the wizard (or skipping mid-flow) navigates back to `/` with
 * the picked filters as query params.
 */
export default function QuizScreen() {
  const dict = useDict();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.flex} edges={["top"]}>
      <Header
        variant="minimal"
        rightAction={
          <Pressable
            onPress={() => router.replace("/")}
            accessibilityRole="link"
            style={({ pressed }) => ({
              paddingHorizontal: 12,
              height: 36,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: "#e7e3d8",
              backgroundColor: pressed ? "#f3efe5" : "#ffffff",
              alignItems: "center",
              justifyContent: "center",
            })}
          >
            <Text style={styles.backText}>{dict.header.backToBrowse}</Text>
          </Pressable>
        }
      />

      <View style={styles.intro}>
        <Text style={styles.eyebrow}>{dict.quiz.intro.eyebrow}</Text>
        <Text style={styles.title}>{dict.quiz.intro.title}</Text>
        <Text style={styles.subtitle}>{dict.quiz.intro.subtitle}</Text>
      </View>

      <View style={{ flex: 1 }}>
        <Quiz />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: "#fbf9f5",
  },
  intro: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
    gap: 4,
  },
  eyebrow: {
    fontFamily: "PlusJakartaSans_700Bold",
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    color: "#0c9281",
    includeFontPadding: false,
  },
  title: {
    fontFamily: "PlusJakartaSans_800ExtraBold",
    fontSize: 22,
    color: "#0d1126",
    includeFontPadding: false,
  },
  subtitle: {
    fontFamily: "PlusJakartaSans_500Medium",
    fontSize: 14,
    lineHeight: 21,
    color: "#5b6379",
    includeFontPadding: false,
  },
  backText: {
    fontFamily: "PlusJakartaSans_700Bold",
    fontSize: 12.5,
    color: "#0d1126",
    includeFontPadding: false,
  },
});

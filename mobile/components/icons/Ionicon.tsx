import Ionicons from "@expo/vector-icons/Ionicons";

interface IoniconProps {
  name: React.ComponentProps<typeof Ionicons>["name"];
  size?: number;
  color?: string;
}

/**
 * Thin alias around `@expo/vector-icons/Ionicons` so screens import a
 * stable `Ionicon` symbol — easy to swap the underlying icon set later
 * (e.g. Lucide) without touching every call-site.
 */
export function Ionicon({ name, size = 18, color = "#0d1126" }: IoniconProps) {
  return <Ionicons name={name} size={size} color={color} />;
}

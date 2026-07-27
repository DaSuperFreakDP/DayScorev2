// DayScore dark theme — forced for both light and dark system settings
const darkTheme = {
  text: "#FFFFFF",
  tint: "#5E72EB",
  background: "#0C0C14",
  foreground: "#FFFFFF",
  card: "#151520",
  cardForeground: "#FFFFFF",
  primary: "#5E72EB",
  primaryForeground: "#FFFFFF",
  secondary: "#1E1E2C",
  secondaryForeground: "#FFFFFF",
  muted: "#1E1E2C",
  mutedForeground: "#9494A8",
  accent: "#5E72EB",
  accentForeground: "#FFFFFF",
  destructive: "#FF3B30",
  destructiveForeground: "#FFFFFF",
  border: "#282840",
  input: "#1E1E2C",
  surface: "#1E1E2C",
};

const colors = {
  light: darkTheme,
  dark: darkTheme,
  radius: 12,

  // Star rating colors (1–5)
  star: ["#FF3B30", "#FF6B35", "#FFD60A", "#7ED321", "#4CD964"] as const,
};

export default colors;

export function getStarColor(stars: number): string {
  const index = Math.max(0, Math.min(4, stars - 1));
  return colors.star[index];
}

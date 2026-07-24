import { Stack } from "expo-router";

export default function AdminLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#0C0C14" },
        headerTintColor: "#FFFFFF",
        headerTitleStyle: { fontFamily: "Inter_600SemiBold", fontSize: 17 },
        headerBackTitle: "Back",
        contentStyle: { backgroundColor: "#0C0C14" },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Users" }} />
      <Stack.Screen name="[userId]" options={{ title: "Score History" }} />
    </Stack>
  );
}

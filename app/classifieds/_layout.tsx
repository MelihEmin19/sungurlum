import { Stack } from 'expo-router';

export default function ClassifiedsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="create" />
      <Stack.Screen name="detail/[id]" />
    </Stack>
  );
}

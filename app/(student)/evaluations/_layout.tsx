import { Stack } from 'expo-router';

export default function EvaluationsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="wizard/[id]" options={{ presentation: 'modal' }} />
    </Stack>
  );
}

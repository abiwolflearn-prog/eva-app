import { Stack } from 'expo-router';
import { AuthProvider } from '../context/AuthContext';
import { AcademicProvider } from '../context/AcademicContext';
import { ThemeProvider } from '../context/ThemeContext';
import { NotificationProvider } from '../context/NotificationContext';
import { NetworkProvider } from '../context/NetworkContext';
import { NotificationBanner } from '../components/NotificationBanner';
import { OfflineBanner } from '../components/OfflineBanner';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NetworkProvider>
        <ThemeProvider>
          <NotificationProvider>
            <AuthProvider>
              <AcademicProvider>
                <OfflineBanner />
                <NotificationBanner />
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="index" />
                  <Stack.Screen name="splash" />
                  <Stack.Screen name="login" />
                  <Stack.Screen name="register" />
                  <Stack.Screen name="academic-selection" />
                  <Stack.Screen name="(student)" />
                  <Stack.Screen name="(admin)" />
                </Stack>
              </AcademicProvider>
            </AuthProvider>
          </NotificationProvider>
        </ThemeProvider>
      </NetworkProvider>
    </GestureHandlerRootView>
  );
}


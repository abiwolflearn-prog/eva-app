import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  Easing, 
  withDelay, 
  withSpring
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../context/AuthContext';

export default function SplashScreen() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  // Animation values
  const logoScale = useSharedValue(0.5);
  const logoOpacity = useSharedValue(0);
  
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(30);
  
  const subtitleOpacity = useSharedValue(0);
  
  const spinnerOpacity = useSharedValue(0);

  useEffect(() => {
    // 1. Logo appears (scale in & fade in)
    logoScale.value = withSpring(1, { damping: 12, stiffness: 90 });
    logoOpacity.value = withTiming(1, { duration: 800 });

    // 2. Title slides & fades in (staggered by 400ms)
    titleOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));
    titleTranslateY.value = withDelay(
      400, 
      withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) })
    );

    // 3. Subtitle appears (staggered by 800ms)
    subtitleOpacity.value = withDelay(800, withTiming(1, { duration: 600 }));

    // 4. Spinner appears (staggered by 1200ms)
    spinnerOpacity.value = withDelay(1200, withTiming(1, { duration: 600 }));
  }, []);

  // Navigate after auth state is resolved AND minimum animation time
  useEffect(() => {
    if (isLoading) return; // Wait for AuthContext to finish loading

    const timer = setTimeout(() => {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (e) {
        // Haptics may fail on some devices
      }
      
      if (user) {
        if (user.role === 'admin') {
          router.replace('/(admin)/dashboard');
        } else {
          router.replace('/(student)/home');
        }
      } else {
        router.replace('/login');
      }
    }, 2200); // Allow animations to settle

    return () => clearTimeout(timer);
  }, [isLoading, user]);

  // Styles
  const animatedLogoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }]
  }));

  const animatedTitleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }]
  }));

  const animatedSubtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value
  }));

  const animatedSpinnerStyle = useAnimatedStyle(() => ({
    opacity: spinnerOpacity.value
  }));

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0F172A', '#1E1B4B']}
        style={StyleSheet.absoluteFillObject}
      />
      
      <Animated.View style={[styles.logoContainer, animatedLogoStyle]}>
        <View style={styles.logoGlow}>
          <Ionicons name="school" size={84} color="#38BDF8" style={styles.logoIcon} />
        </View>
      </Animated.View>

      <Animated.View style={[styles.textContainer, animatedTitleStyle]}>
        <Text style={styles.title}>EVA</Text>
      </Animated.View>

      <Animated.View style={[styles.subtitleContainer, animatedSubtitleStyle]}>
        <Text style={styles.subtitle}>Teacher Evaluation System</Text>
      </Animated.View>

      <Animated.View style={[styles.spinnerContainer, animatedSpinnerStyle]}>
        <ActivityIndicator size="large" color="#2563EB" />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 20,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  logoGlow: {
    padding: 15,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    justifyContent: 'center',
    alignItems: 'center',
    width: 120,
    height: 120,
  },
  logoIcon: {
    textShadowColor: 'rgba(56, 189, 248, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  textContainer: {
    marginBottom: 8,
  },
  title: {
    fontSize: 56,
    fontWeight: '900',
    color: '#F8FAFC',
    letterSpacing: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  subtitleContainer: {
    marginBottom: 40,
  },
  subtitle: {
    fontSize: 15,
    color: '#94A3B8',
    fontWeight: '600',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
  },
  spinnerContainer: {
    position: 'absolute',
    bottom: '15%',
  }
});

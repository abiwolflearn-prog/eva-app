import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import Animated, { 
  FadeInUp, 
  FadeOutUp, 
  Layout, 
  SlideInUp, 
  SlideOutUp 
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useNotifications, Notification } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

export const NotificationBanner = () => {
  const { notifications, markAsRead } = useNotifications();
  const { theme } = useTheme();
  const [activeNotification, setActiveNotification] = useState<Notification | null>(null);

  useEffect(() => {
    const unread = notifications.find(n => !n.read);
    if (unread) {
      setActiveNotification(unread);
      const timer = setTimeout(() => {
        markAsRead(unread.id);
        setActiveNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      setActiveNotification(null);
    }
  }, [notifications, markAsRead]);

  if (!activeNotification) return null;

  const getIcon = () => {
    switch (activeNotification.type) {
      case 'success': return 'checkmark-circle';
      case 'error': return 'alert-circle';
      case 'warning': return 'warning';
      default: return 'information-circle';
    }
  };

  const getColor = () => {
    switch (activeNotification.type) {
      case 'success': return theme.success;
      case 'error': return theme.error;
      case 'warning': return theme.warning;
      default: return theme.primary;
    }
  };

  return (
    <Animated.View 
      entering={SlideInUp.duration(400)} 
      exiting={SlideOutUp.duration(300)}
      style={[
        styles.container, 
        { 
          backgroundColor: theme.surface,
          borderLeftColor: getColor(),
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 5,
        }
      ]}
    >
      <View style={styles.content}>
        <Ionicons name={getIcon() as any} size={24} color={getColor()} style={styles.icon} />
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: theme.text }]}>{activeNotification.title}</Text>
          <Text style={[styles.message, { color: theme.textSecondary }]} numberOfLines={2}>
            {activeNotification.message}
          </Text>
        </View>
        <TouchableOpacity onPress={() => markAsRead(activeNotification.id)}>
          <Ionicons name="close" size={20} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    zIndex: 9999,
    borderRadius: 12,
    borderLeftWidth: 6,
    padding: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  message: {
    fontSize: 12,
  },
});

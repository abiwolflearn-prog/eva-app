import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle, TextStyle, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  variant?: 'primary' | 'secondary' | 'outline';
  icon?: keyof typeof Ionicons.glyphMap;
}

export const CustomButton: React.FC<CustomButtonProps> = ({
  title, onPress, loading, disabled, style, textStyle, variant = 'primary', icon
}) => {
  const { theme } = useTheme();

  const getBackgroundColor = () => {
    if (disabled) return theme.border;
    if (variant === 'secondary') return theme.secondary;
    if (variant === 'outline') return 'transparent';
    return theme.primary;
  };

  const getTextColor = () => {
    if (disabled) return theme.textSecondary;
    if (variant === 'outline') return theme.primary;
    return '#FFFFFF'; // Buttons usually have white text on primary/secondary
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: getBackgroundColor() },
        variant === 'outline' && { borderColor: theme.primary, borderWidth: 1 },
        style
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <View style={styles.content}>
          <Text style={[styles.text, { color: getTextColor() }, textStyle]}>{title}</Text>
          {icon && (
            <Ionicons name={icon} size={20} color={getTextColor()} style={styles.icon} />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  icon: {
    marginLeft: 8,
  }
});

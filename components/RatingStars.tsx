import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';

interface RatingStarsProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: number;
  showText?: boolean;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  onRatingChange,
  readonly = false,
  size = 28,
  showText = false
}) => {
  const { theme } = useTheme();
  const [hoverRating, setHoverRating] = useState(0);

  const handlePress = (selectedRating: number) => {
    if (readonly) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onRatingChange) {
      onRatingChange(selectedRating);
    }
  };

  const currentRating = hoverRating > 0 && !readonly ? hoverRating : rating;

  return (
    <View style={styles.container}>
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            disabled={readonly}
            onPress={() => handlePress(star)}
            onPressIn={() => !readonly && setHoverRating(star)}
            onPressOut={() => !readonly && setHoverRating(0)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={star <= currentRating ? "star" : "star-outline"}
              size={size}
              color={theme.warning}
              style={{ marginRight: 4 }}
            />
          </TouchableOpacity>
        ))}
      </View>
      {showText && (
        <Text style={[styles.text, { color: theme.textSecondary }]}>{rating.toFixed(1)} / 5.0</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  }
});

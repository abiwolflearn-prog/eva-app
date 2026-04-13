import React from 'react';
import { Text, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Program } from '../constants/universityData';

interface ProgramCardProps {
  program: Program;
  onPress: () => void;
  isSelected?: boolean;
}

export const ProgramCard: React.FC<ProgramCardProps> = ({ program, onPress, isSelected }) => {
  const { theme, isDark } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.card, 
        { 
          backgroundColor: isSelected ? (isDark ? theme.primary + '20' : theme.primary + '08') : theme.surface,
          borderColor: isSelected ? theme.primary : theme.border
        }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.dot, { backgroundColor: isSelected ? theme.primary : theme.border }]} />
      <Text style={[
        styles.name, 
        { color: isSelected ? theme.primary : theme.text, fontWeight: isSelected ? '700' : '500' }
      ]} numberOfLines={2}>
        {program.name}
      </Text>
      <Ionicons
        name={isSelected ? 'checkmark-circle' : 'chevron-forward'}
        size={22}
        color={isSelected ? theme.primary : theme.textSecondary}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 16,
  },
  name: {
    flex: 1,
    fontSize: 16,
  },
});

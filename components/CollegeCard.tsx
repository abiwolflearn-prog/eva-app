import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { College } from '../constants/universityData';

interface CollegeCardProps {
  college: College;
  onPress: () => void;
}

export const CollegeCard: React.FC<CollegeCardProps> = ({ college, onPress }) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: theme.surface }]} 
      onPress={onPress} 
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: college.color + '15' }]}>
        <Ionicons name={college.icon as any} size={36} color={college.color} />
      </View>
      <View style={styles.content}>
        <Text style={[styles.name, { color: theme.text }]} numberOfLines={2}>{college.name}</Text>
        <View style={styles.badge}>
          <Ionicons name="school-outline" size={14} color={theme.textSecondary} />
          <Text style={[styles.badgeText, { color: theme.textSecondary }]}>{college.programs.length} Programs</Text>
        </View>
      </View>
      <View style={[styles.accentBar, { backgroundColor: college.color }]} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    lineHeight: 24,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 12,
    marginLeft: 4,
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
});

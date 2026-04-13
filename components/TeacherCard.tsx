import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Teacher } from '../types';

interface TeacherCardProps {
  teacher: Teacher;
  onPress: () => void;
}

export const TeacherCard: React.FC<TeacherCardProps> = ({ teacher, onPress }) => {
  const { theme, isDark } = useTheme();

  return (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: theme.surface }]} 
      onPress={onPress} 
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: theme.primaryLight }]}>
          <Text style={[styles.avatarText, { color: '#fff' }]}>{teacher.name.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.info}>
          <Text style={[styles.name, { color: theme.text }]}>{teacher.name}</Text>
          <Text style={[styles.courseName, { color: theme.text }]}>{teacher.courseName}</Text>
          <Text style={[styles.program, { color: theme.textSecondary }]}>{teacher.program}</Text>
        </View>
        <View style={[styles.ratingBadge, { backgroundColor: isDark ? '#334155' : '#FEF3C7' }]}>
          <Ionicons name="star" size={14} color={isDark ? theme.warning : '#D97706'} />
          <Text style={[styles.ratingText, { color: isDark ? theme.text : '#D97706' }]}>{teacher.averageRating.toFixed(1)}</Text>
        </View>
      </View>
      <View style={[styles.footer, { borderTopColor: theme.border }]}>
        <Text style={[styles.evalCount, { color: theme.textSecondary }]}>{teacher.totalEvaluations} Evaluations</Text>
        <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  courseName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  program: {
    fontSize: 12,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 8,
  },
  evalCount: {
    fontSize: 12,
  }
});

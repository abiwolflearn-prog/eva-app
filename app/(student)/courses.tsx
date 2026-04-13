import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export default function CoursesScreen() {
  const { theme } = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <Text style={[styles.title, { color: theme.text }]}>My Courses</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Select a course to evaluate teachers</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.emptyState}>
          <Ionicons name="library-outline" size={48} color={theme.border} />
          <Text style={[styles.emptyStateText, { color: theme.textSecondary }]}>No courses enrolled.</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 24, borderBottomWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  title: { fontSize: 32, fontWeight: '700' },
  subtitle: { fontSize: 16, marginTop: 4 },
  content: { padding: 24, flex: 1, justifyContent: 'center' },
  emptyState: { alignItems: 'center', justifyContent: 'center', padding: 32, marginTop: 40 },
  emptyStateText: { fontSize: 16, marginTop: 8 }
});

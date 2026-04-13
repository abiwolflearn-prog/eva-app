import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { COLLEGES, UNIVERSITY_NAME } from '../../constants/universityData';
import { CollegeCard } from '../../components/CollegeCard';
import { Ionicons } from '@expo/vector-icons';

export default function CollegesScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <View style={[styles.universityBadge, { backgroundColor: theme.primary + '12' }]}>
          <Ionicons name="school" size={24} color={theme.primary} />
        </View>
        <Text style={[styles.universityName, { color: theme.text }]}>{UNIVERSITY_NAME}</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Select your college to continue</Text>
      </View>

      <FlatList
        data={COLLEGES}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <CollegeCard
            college={item}
            onPress={() => router.push({ pathname: '/(student)/programs', params: { collegeId: item.id } })}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    padding: 24,
    paddingTop: 65,
    alignItems: 'center',
    borderBottomWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2,
  },
  universityBadge: {
    width: 56, height: 56, borderRadius: 28,
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  universityName: { fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 16, textAlign: 'center' },
  list: { padding: 20, paddingBottom: 40 },
});

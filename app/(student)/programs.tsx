import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { getCollegeById } from '../../constants/universityData';
import { ProgramCard } from '../../components/ProgramCard';
import { useAcademic } from '../../context/AcademicContext';
import { Ionicons } from '@expo/vector-icons';

export default function ProgramsScreen() {
  const { collegeId } = useLocalSearchParams<{ collegeId: string }>();
  const router = useRouter();
  const { academicQuery, setAcademicInfo } = useAcademic();
  const { theme } = useTheme();
  const [search, setSearch] = useState('');

  const college = getCollegeById(collegeId as string);

  const filteredPrograms = useMemo(() => {
    if (!college) return [];
    if (!search.trim()) return college.programs;
    return college.programs.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [college, search]);

  if (!college) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.error }]}>College not found.</Text>
      </View>
    );
  }

  const handleSelectProgram = async (programId: string) => {
    const program = college.programs.find((p) => p.id === programId);
    if (!program) return;
    
    await setAcademicInfo({
      collegeId: college.id,
      programId: program.id,
      year: academicQuery?.year || 1,
      semester: academicQuery?.semester || 1
    });
    
    router.replace('/(student)/home');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border, borderLeftColor: college.color }]}>
        <View style={[styles.iconBadge, { backgroundColor: college.color + '15' }]}>
          <Ionicons name={college.icon as any} size={28} color={college.color} />
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: theme.text }]}>{college.shortName}</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Select your program</Text>
        </View>
      </View>

      <View style={[styles.searchContainer, { backgroundColor: theme.surface }]}>
        <Ionicons name="search" size={20} color={theme.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search programs..."
          placeholderTextColor={theme.textSecondary}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <Ionicons name="close-circle" size={20} color={theme.textSecondary} onPress={() => setSearch('')} />
        )}
      </View>

      <FlatList
        data={filteredPrograms}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <ProgramCard
            program={item}
            onPress={() => handleSelectProgram(item.id)}
          />
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color={theme.border} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No programs match "{search}"</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    padding: 24, paddingTop: 56, borderBottomWidth: 1, borderLeftWidth: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2,
  },
  iconBadge: {
    width: 52, height: 52, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', marginRight: 16,
  },
  headerText: { flex: 1 },
  title: { fontSize: 24, fontWeight: '700' },
  subtitle: { fontSize: 16, marginTop: 2 },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center', borderRadius: 12,
    paddingHorizontal: 16, height: 46, margin: 24, marginBottom: 0,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 16 },
  list: { padding: 24, paddingBottom: 40 },
  emptyState: { alignItems: 'center', justifyContent: 'center', padding: 32, marginTop: 40 },
  emptyText: { fontSize: 16, marginTop: 8 },
});

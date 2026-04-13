import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TextInput, ActivityIndicator, Text, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import { getTeachers } from '../../../services/teacherService';
import { Teacher } from '../../../types';
import { TeacherCard } from '../../../components/TeacherCard';
import { Breadcrumb } from '../../../components/Breadcrumb';
import { useAcademic } from '../../../context/AcademicContext';
import { getCollegeById } from '../../../constants/universityData';

export default function TeachersDirectory() {
  const { theme, isDark } = useTheme();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const { academicQuery } = useAcademic();

  const college = academicQuery ? getCollegeById(academicQuery.collegeId) : null;

  useEffect(() => {
    fetchTeachers();
  }, [academicQuery]);

  const searchTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchTeachers = async (query = '') => {
    try {
      setLoading(true);
      const filters = {
        search: query,
        college: college?.name,
        program: college?.programs.find((p: any) => p.id === academicQuery?.programId)?.name,
        year: academicQuery?.year,
        semester: academicQuery?.semester
      };
      const data = await getTeachers(filters);
      setTeachers(data);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text: string) => {
    setSearch(text);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      fetchTeachers(text);
    }, 300);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTeachers(search);
    setRefreshing(false);
  };

  const breadcrumbItems = [
    { label: 'Home', onPress: () => router.navigate('/(student)/home') },
    { label: 'Teachers' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Breadcrumb items={breadcrumbItems} />
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <Text style={[styles.title, { color: theme.text }]}>Teachers Directory</Text>
        {academicQuery && (
          <View style={[styles.filterTag, { backgroundColor: theme.primary + '15' }]}>
            <Ionicons name="funnel" size={12} color={theme.primary} />
            <Text style={[styles.filterTagText, { color: theme.primary }]}>
              {college?.programs.find(p => p.id === academicQuery.programId)?.name} • Yr {academicQuery.year} Sem {academicQuery.semester}
            </Text>
          </View>
        )}
        <View style={[styles.searchContainer, { backgroundColor: theme.background }]}>
          <Ionicons name="search" size={20} color={theme.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search by name..."
            placeholderTextColor={theme.textSecondary}
            value={search}
            onChangeText={handleSearch}
          />
        </View>
      </View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <FlatList
          data={teachers}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TeacherCard
              teacher={item}
              onPress={() => router.push(`/(student)/teachers/${item._id}`)}
            />
          )}
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color={theme.border} />
              <Text style={[styles.emptyStateText, { color: theme.textSecondary }]}>No teachers found.</Text>
            </View>
          )}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={true}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16, borderBottomWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 4 },
  filterTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 16,
  },
  filterTagText: { fontSize: 12, fontWeight: '600', marginLeft: 4 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 12, height: 46 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 16 },
  list: { padding: 16 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyState: { alignItems: 'center', justifyContent: 'center', padding: 24, marginTop: 40 },
  emptyStateText: { fontSize: 16, marginTop: 12 },
});

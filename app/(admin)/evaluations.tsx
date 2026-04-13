import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { getAllEvaluations, deleteEvaluation } from '../../services/adminService';
import { Evaluation } from '../../types';

export default function AdminEvaluationsScreen() {
  const { theme, isDark } = useTheme();
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getAllEvaluations();
      setEvaluations(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Evaluation', 'Are you sure? This will remove the comment and update teacher ratings.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await deleteEvaluation(id);
          fetchData();
        } catch (error) {
          Alert.alert('Error', 'Failed to delete evaluation');
        }
      }},
    ]);
  };

  const renderEvaluationItem = ({ item }: { item: Evaluation }) => (
    <View style={[styles.card, { backgroundColor: theme.surface }]}>
      <View style={styles.header}>
        <View style={styles.teacherInfo}>
          <Text style={[styles.teacherName, { color: theme.text }]}>{item.teacher?.name || 'Unknown Teacher'}</Text>
          <Text style={[styles.courseName, { color: theme.textSecondary }]}>{item.teacher?.courseName || 'Unknown Course'}</Text>
        </View>
        <View style={[styles.ratingBadge, { backgroundColor: theme.background }]}>
          <Ionicons name="star" size={14} color="#FFD700" />
          <Text style={[styles.ratingText, { color: theme.text }]}>{item.rating.toFixed(1)}</Text>
        </View>
      </View>

      <View style={styles.academicBadgeContainer}>
        <Text style={[styles.academicBadge, { backgroundColor: theme.primary + '20', color: theme.primary }]}>{item.college}</Text>
        <Text style={[styles.academicBadge, { backgroundColor: theme.primary + '20', color: theme.primary }]}>{item.program}</Text>
        <Text style={[styles.academicBadge, { backgroundColor: theme.primary + '20', color: theme.primary }]}>Y{item.year} S{item.semester}</Text>
      </View>
      
      <Text style={[styles.comment, { color: theme.text }]} numberOfLines={3}>{item.comment || 'No comment provided'}</Text>
      
      <View style={[styles.footer, { borderTopColor: theme.border }]}>
        <View style={styles.studentInfo}>
          <Ionicons name="person-outline" size={14} color={theme.textSecondary} />
          <Text style={[styles.studentText, { color: theme.textSecondary }]}>
            {item.student?.name || 'Unknown Student'}
          </Text>
        </View>
        <TouchableOpacity onPress={() => handleDelete(item._id)} style={styles.deleteBtn}>
          <Ionicons name="trash-outline" size={18} color={theme.error} />
          <Text style={[styles.deleteText, { color: theme.error }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {loading ? (
        <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={evaluations}
          keyExtractor={(item) => item._id}
          renderItem={renderEvaluationItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={() => <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No evaluations recorded yet</Text>}
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
  list: { padding: 16 },
  card: { borderRadius: 12, padding: 16, marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  teacherInfo: { flex: 1 },
  teacherName: { fontSize: 16, fontWeight: '700' },
  courseName: { fontSize: 12 },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  ratingText: { marginLeft: 4, fontWeight: '700', fontSize: 12 },
  academicBadgeContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginVertical: 4 },
  academicBadge: { fontSize: 10, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, fontWeight: 'bold' },
  comment: { fontSize: 14, marginVertical: 8, fontStyle: 'italic' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, borderTopWidth: 1, paddingTop: 12 },
  studentInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  studentText: { marginLeft: 6, fontSize: 12 },
  deleteBtn: { flexDirection: 'row', alignItems: 'center' },
  deleteText: { fontSize: 12, fontWeight: '700', marginLeft: 4 },
  emptyText: { textAlign: 'center', marginTop: 40 },
});

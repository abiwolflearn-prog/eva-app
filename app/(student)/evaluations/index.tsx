import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import api from '../../../services/api';
import { Evaluation } from '../../../types';

export default function MyEvaluationsScreen() {
  const { theme, isDark } = useTheme();
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchEvaluations = async () => {
    try {
      const response = await api.get('/evaluations/me');
      setEvaluations(response.data);
    } catch (e) {
      console.error('Error fetching evaluations:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEvaluations();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchEvaluations();
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Evaluation',
      'Are you sure you want to delete this evaluation? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/evaluations/${id}`);
              setEvaluations(prev => prev.filter(e => e._id !== id));
            } catch (e) {
              Alert.alert('Error', 'Failed to delete evaluation');
            }
          }
        }
      ]
    );
  };

  const EvaluationItem = ({ item }: { item: Evaluation }) => (
    <View style={[styles.card, { backgroundColor: theme.surface }]}>
      <View style={styles.cardHeader}>
        <View style={styles.teacherInfo}>
          <Text style={[styles.teacherName, { color: theme.text }]}>{item.teacher.name}</Text>
          <Text style={[styles.courseName, { color: theme.textSecondary }]}>{item.teacher.courseName}</Text>
        </View>
        <View style={[
          styles.ratingBadge, 
          { 
            backgroundColor: isDark ? theme.primary + '20' : '#fffbeb', 
            borderColor: isDark ? theme.border : '#fef3c7' 
          }
        ]}>
          <Ionicons name="star" size={14} color="#f59e0b" />
          <Text style={[styles.ratingText, { color: theme.text }]}>{item.rating}</Text>
        </View>
      </View>
      
      <Text style={[styles.comment, { color: theme.textSecondary }]} numberOfLines={2}>
        {item.comment || 'No comment provided.'}
      </Text>
      
      <View style={[styles.footer, { borderTopColor: theme.border }]}>
        <Text style={[styles.date, { color: theme.textSecondary }]}>{new Date(item.createdAt).toLocaleDateString()}</Text>
        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.actionBtn} 
            onPress={() => router.push({ pathname: '/(student)/evaluations/wizard/[id]', params: { id: item.teacher._id, editId: item._id } })}
          >
            <Ionicons name="create-outline" size={18} color={theme.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionBtn, { marginLeft: 12 }]} 
            onPress={() => handleDelete(item._id)}
          >
            <Ionicons name="trash-outline" size={18} color={theme.error} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>My Evaluations</Text>
      </View>

      <FlatList
        data={evaluations}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <EvaluationItem item={item} />}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color={theme.border} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>You haven't submitted any evaluations yet.</Text>
            <TouchableOpacity style={[styles.startBtn, { backgroundColor: theme.primary }]} onPress={() => router.push('/(student)/teachers')}>
              <Text style={styles.startBtnText}>Start Evaluating</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 56,
    borderBottomWidth: 1,
  },
  backBtn: { marginRight: 16 },
  title: { fontSize: 20, fontWeight: '700' },
  list: { padding: 16, paddingBottom: 40 },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  teacherInfo: { flex: 1 },
  teacherName: { fontSize: 16, fontWeight: '700' },
  courseName: { fontSize: 12, marginTop: 2 },
  ratingBadge: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1
  },
  ratingText: { fontSize: 12, fontWeight: '700', marginLeft: 4 },
  comment: { fontSize: 12, marginBottom: 16, lineHeight: 18 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, paddingTop: 12 },
  date: { fontSize: 12 },
  actions: { flexDirection: 'row', alignItems: 'center' },
  actionBtn: { padding: 4 },
  emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 100, padding: 24 },
  emptyText: { fontSize: 16, textAlign: 'center', marginTop: 16, marginBottom: 20 },
  startBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  startBtnText: { fontSize: 16, color: '#fff', fontWeight: '600' },
});

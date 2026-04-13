import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import { getTeacherById } from '../../../services/teacherService';
import { getEvaluationsByTeacher } from '../../../services/evaluationService';
import { Teacher, Evaluation } from '../../../types';
import { RatingStars } from '../../../components/RatingStars';
import { CustomButton } from '../../../components/CustomButton';

export default function TeacherDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [teacherData, evalsData] = await Promise.all([
        getTeacherById(id as string),
        getEvaluationsByTeacher(id as string)
      ]);
      setTeacher(teacherData);
      setEvaluations(evalsData);
    } catch (error) {
      console.error('Error fetching teacher data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !teacher) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Teacher Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scroll}>
        <View style={[styles.profileSection, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
          <View style={[styles.avatar, { backgroundColor: theme.primary + '20' }]}>
            <Text style={[styles.avatarText, { color: theme.primary }]}>{teacher.name.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={[styles.name, { color: theme.text }]}>{teacher.name}</Text>
          <Text style={[styles.courseName, { color: theme.text }]}>{teacher.courseName}</Text>
          <Text style={[styles.academicInfo, { color: theme.textSecondary }]}>{teacher.college} • {teacher.program}</Text>
          <Text style={[styles.yrSem, { color: theme.primary }]}>Year {teacher.year} • Semester {teacher.semester}</Text>
          
          <View style={styles.ratingOverview}>
            <Text style={[styles.averageRating, { color: theme.text }]}>{teacher.averageRating.toFixed(1)}</Text>
            <RatingStars rating={teacher.averageRating} readonly size={24} />
            <Text style={[styles.totalEvals, { color: theme.textSecondary }]}>based on {teacher.totalEvaluations} reviews</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Student Reviews</Text>
          
          {evaluations.length === 0 ? (
            <View style={styles.emptyComments}>
              <Ionicons name="chatbubbles-outline" size={48} color={theme.border} />
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No reviews yet. Be the first to evaluate!</Text>
            </View>
          ) : (
            evaluations.map(ev => (
              <View key={ev._id} style={[styles.commentCard, { backgroundColor: theme.surface }]}>
                <View style={styles.commentHeader}>
                  <Text style={[styles.studentName, { color: theme.text }]}>Verified Student</Text>
                  <RatingStars rating={ev.rating} readonly size={14} />
                </View>
                {ev.comment ? <Text style={[styles.commentText, { color: theme.textSecondary }]}>{ev.comment}</Text> : null}
                <Text style={styles.dateText}>{new Date(ev.createdAt).toLocaleDateString()}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
        <CustomButton 
          title="Evaluate Teacher" 
          onPress={() => router.push(`/(student)/evaluations/wizard/${teacher._id}`)} 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    padding: 16, paddingTop: 48, borderBottomWidth: 1,
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  scroll: { flex: 1 },
  profileSection: { alignItems: 'center', padding: 24, borderBottomWidth: 1 },
  avatar: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  avatarText: { fontSize: 32, fontWeight: '700' },
  name: { fontSize: 24, fontWeight: '700' },
  courseName: { fontSize: 16, fontWeight: '700', marginTop: 4 },
  academicInfo: { fontSize: 12, marginTop: 2 },
  yrSem: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  ratingOverview: { alignItems: 'center', marginTop: 24 },
  averageRating: { fontSize: 48, fontWeight: '700', marginBottom: 8 },
  totalEvals: { fontSize: 12, marginTop: 8 },
  section: { padding: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '700', marginBottom: 16 },
  commentCard: { 
    padding: 16, borderRadius: 12, marginBottom: 16, 
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 
  },
  commentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  studentName: { fontSize: 16, fontWeight: '600' },
  commentText: { fontSize: 14, marginTop: 4, lineHeight: 22 },
  dateText: { fontSize: 12, color: '#94a3b8', marginTop: 8, textAlign: 'right' },
  emptyComments: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40, opacity: 0.5 },
  emptyText: { fontSize: 16, textAlign: 'center', marginTop: 8 },
  footer: { padding: 16, borderTopWidth: 1 }
});

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { RatingStars } from '../../../../components/RatingStars';
import { CustomButton } from '../../../../components/CustomButton';
import { submitEvaluation } from '../../../../services/evaluationService';
import { useTheme } from '../../../../context/ThemeContext';
import { useNotifications } from '../../../../context/NotificationContext';
import { Ionicons } from '@expo/vector-icons';
import { getSystemSettings, SystemSettings } from '../../../../services/systemService';
import { useAcademic } from '../../../../context/AcademicContext';
import { getTeacherById } from '../../../../services/teacherService';
import { Teacher } from '../../../../types';
import api from '../../../../services/api';

export default function EvaluationWizard() {
  const { id, editId } = useLocalSearchParams<{ id: string, editId?: string }>();
  const router = useRouter();
  const { academicQuery } = useAcademic();
  const { theme, isDark } = useTheme();
  const { showNotification } = useNotifications();

  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [criteria, setCriteria] = useState({
    teachingQuality: 0,
    communication: 0,
    punctuality: 0,
    courseManagement: 0,
    studentSupport: 0,
    professionalism: 0,
  });
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [settingsData, teacherData] = await Promise.all([
          getSystemSettings(),
          getTeacherById(id as string)
        ]);
        
        setSettings(settingsData);
        setTeacher(teacherData);

        if (editId) {
          const response = await api.get(`/evaluations/${editId}`);
          setRating(response.data.rating);
          setCriteria(response.data.criteria || {
            teachingQuality: 0,
            communication: 0,
            punctuality: 0,
            courseManagement: 0,
            studentSupport: 0,
            professionalism: 0,
          });
          setComment(response.data.comment);
        }

        if (!settingsData.evaluationPeriodOpen && !editId) {
          Alert.alert('Evaluation Closed', 'The evaluation period is currently closed.', [
            { text: 'OK', onPress: () => router.back() }
          ]);
        }
      } catch (error) {
        console.error('Error fetching wizard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, editId]);

  const updateCriteria = (key: keyof typeof criteria, value: number) => {
    setCriteria(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    const allCriteriaRated = Object.values(criteria).every(v => v > 0);
    if (!allCriteriaRated || rating === 0) {
      Alert.alert('Form Incomplete', 'Please provide a rating for all categories including the overall rating.');
      return;
    }

    if (!academicQuery) {
      Alert.alert('Error', 'Academic information not found.');
      return;
    }

    Alert.alert(
      editId ? 'Update Evaluation' : 'Confirm Submission',
      'Are you sure you want to proceed?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: editId ? 'Update' : 'Submit', 
          onPress: async () => {
            try {
              setSubmitting(true);
              const payload = {
                teacherId: id as string,
                college: teacher?.college || '',
                program: teacher?.program || '',
                year: academicQuery.year,
                semester: academicQuery.semester,
                rating,
                criteria,
                comment
              };

              if (editId) {
                await api.put(`/evaluations/${editId}`, payload);
              } else {
                await submitEvaluation(payload);
              }
              
              showNotification(
                'Success', 
                `Evaluation for ${teacher?.name} has been ${editId ? 'updated' : 'submitted'}.`, 
                'success'
              );

              router.back();
            } catch (error: any) {
              let errorMessage = 'Failed to submit evaluation.';
              if (error.message?.includes('already evaluated')) {
                errorMessage = 'You have already evaluated this teacher.';
              } else if (error.message?.includes('Network Error') || error.message?.includes('Cannot reach')) {
                errorMessage = 'No internet connection. Your evaluation has been saved and will be submitted automatically when you reconnect.';
              } else if (error.message?.includes('timed out')) {
                errorMessage = 'Connection timed out. Please try again.';
              } else if (error.message) {
                errorMessage = error.message;
              }
              Alert.alert('Error', errorMessage);
            } finally {
              setSubmitting(false);
            }
          }
        }
      ]
    );
  };

  const renderRatingCard = (
    title: string, 
    key: keyof typeof criteria, 
    icon: any, 
    description: string
  ) => (
    <View style={[styles.criteriaCard, { backgroundColor: theme.surface }]}>
      <View style={styles.criteriaHeader}>
        <View style={[styles.iconContainer, { backgroundColor: theme.primary + '15' }]}>
          <Ionicons name={icon} size={22} color={theme.primary} />
        </View>
        <View style={styles.criteriaTitleContainer}>
          <Text style={[styles.criteriaTitle, { color: theme.text }]}>{title}</Text>
          <Text style={[styles.criteriaDesc, { color: theme.textSecondary }]}>{description}</Text>
        </View>
      </View>
      <View style={styles.starsRow}>
        <RatingStars 
          rating={criteria[key]} 
          onRatingChange={(v) => updateCriteria(key, v)} 
          size={32} 
        />
        <Text style={[styles.ratingLabel, { color: theme.primary }]}>
          {criteria[key] > 0 ? `${criteria[key]}/5` : '-'}
        </Text>
      </View>
    </View>
  );

  if (loading || !teacher) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Evaluation Form</Text>
          <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>Year {academicQuery?.year} • Sem {academicQuery?.semester}</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Teacher Profile Card */}
        <View style={[styles.teacherProfileCard, { backgroundColor: theme.primary }]}>
          <View style={styles.teacherDetails}>
            <Text style={styles.teacherLabel}>Evaluating Instructor</Text>
            <Text style={styles.teacherNameFull}>{teacher.name}</Text>
            <View style={styles.courseBadge}>
              <Text style={styles.courseText}>{teacher.courseName}</Text>
            </View>
          </View>
          <View style={styles.teacherIconContainer}>
            <Ionicons name="person-circle-outline" size={60} color="#fff" />
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Performance Criteria</Text>
        
        {renderRatingCard(
          "Teaching Quality", 
          "teachingQuality", 
          "school-outline", 
          "Explains concepts clearly and uses examples effectively"
        )}
        
        {renderRatingCard(
          "Communication", 
          "communication", 
          "chatbubble-ellipses-outline", 
          "Clear speaking and engages students in discussions"
        )}
        
        {renderRatingCard(
          "Punctuality & Preparation", 
          "punctuality", 
          "time-outline", 
          "Comes on time and is well-prepared for class"
        )}
        
        {renderRatingCard(
          "Course Management", 
          "courseManagement", 
          "list-outline", 
          "Follows syllabus and organizes materials effectively"
        )}
        
        {renderRatingCard(
          "Student Support", 
          "studentSupport", 
          "help-circle-outline", 
          "Helps students and provides clear answers to questions"
        )}
        
        {renderRatingCard(
          "Professionalism", 
          "professionalism", 
          "shield-checkmark-outline", 
          "Fair grading practices and respectful behavior"
        )}

        {/* Overall Rating Card */}
        <View style={[styles.overallCard, { backgroundColor: theme.surface, borderColor: theme.primary, borderWidth: 1 }]}>
          <Text style={[styles.overallTitle, { color: theme.text }]}>Overall Rating</Text>
          <Text style={[styles.overallDesc, { color: theme.textSecondary }]}>Your general assessment of the instructor</Text>
          <View style={styles.overallStarsContainer}>
            <RatingStars rating={rating} onRatingChange={setRating} size={44} />
            <Text style={[styles.overallRatingLabel, { color: theme.primary }]}>
              {rating === 5 ? 'Excellent' : 
               rating === 4 ? 'Very Good' : 
               rating === 3 ? 'Good' : 
               rating === 2 ? 'Fair' : 
               rating === 1 ? 'Poor' : 'Tap to rate'}
            </Text>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.inputLabel, { color: theme.text }]}>Additional Feedback (Optional)</Text>
          <TextInput
            style={[styles.textInput, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border, borderWidth: 1 }]}
            multiline
            numberOfLines={5}
            placeholder="Share any other thoughts or suggestions for improvement..."
            placeholderTextColor={theme.textSecondary}
            value={comment}
            onChangeText={setComment}
          />
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
        <CustomButton 
          title={editId ? "Update Evaluation" : "Submit Evaluation"} 
          onPress={handleSubmit} 
          loading={submitting} 
          disabled={rating === 0 || !Object.values(criteria).every(v => v > 0)} 
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { 
    flexDirection: 'row', alignItems: 'center', 
    paddingHorizontal: 20, paddingTop: 50, paddingBottom: 15, borderBottomWidth: 1, 
  },
  backBtn: { marginRight: 15 },
  headerInfo: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  headerSubtitle: { fontSize: 12 },
  headerSpacer: { width: 24 },
  scroll: { padding: 20 },
  teacherProfileCard: { 
    flexDirection: 'row', borderRadius: 16, padding: 20, marginBottom: 25, 
    justifyContent: 'space-between', alignItems: 'center' 
  },
  teacherDetails: { flex: 1 },
  teacherLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginBottom: 2 },
  teacherNameFull: { color: '#fff', fontSize: 20, fontWeight: '800' },
  courseBadge: { 
    backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, 
    borderRadius: 8, alignSelf: 'flex-start', marginTop: 8 
  },
  courseText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  teacherIconContainer: { marginLeft: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 15, marginTop: 5 },
  criteriaCard: { 
    borderRadius: 16, padding: 16, marginBottom: 16, 
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 
  },
  criteriaHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  iconContainer: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  criteriaTitleContainer: { flex: 1, marginLeft: 12 },
  criteriaTitle: { fontSize: 15, fontWeight: '700' },
  criteriaDesc: { fontSize: 11, marginTop: 2 },
  starsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ratingLabel: { fontSize: 14, fontWeight: '700' },
  overallCard: { padding: 20, borderRadius: 16, alignItems: 'center', marginVertical: 20 },
  overallTitle: { fontSize: 18, fontWeight: '800', marginBottom: 4 },
  overallDesc: { fontSize: 13, marginBottom: 20 },
  overallStarsContainer: { alignItems: 'center' },
  overallRatingLabel: { fontSize: 16, fontWeight: '700', marginTop: 10 },
  inputContainer: { marginBottom: 30 },
  inputLabel: { fontSize: 16, fontWeight: '700', marginBottom: 10, marginLeft: 4 },
  textInput: { 
    borderRadius: 16, padding: 16, height: 120, textAlignVertical: 'top', 
    fontSize: 15 
  },
  bottomSpacer: { height: 40 },
  footer: { padding: 20, borderTopWidth: 1 }
});

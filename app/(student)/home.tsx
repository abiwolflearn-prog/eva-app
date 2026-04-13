import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, StatusBar, Platform, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useAcademic } from '../../context/AcademicContext';
import { useTheme } from '../../context/ThemeContext';
import { useNotifications } from '../../context/NotificationContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getCollegeById, UNIVERSITY_NAME } from '../../constants/universityData';
import { getAnalytics, getMyEvaluations } from '../../services/evaluationService';
import { getTeachers } from '../../services/teacherService';

export default function HomeScreen() {
  const { user } = useAuth();
  const { academicQuery } = useAcademic();
  const { theme, isDark } = useTheme();
  const { unreadCount } = useNotifications();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalTeachers: 0, myEvaluations: 0 });
  const [analytics, setAnalytics] = useState<{ topCollege: any } | null>(null);

  const college = academicQuery ? getCollegeById(academicQuery.collegeId) : null;
  const program = college?.programs.find(p => p.id === academicQuery?.programId);

  const fetchData = useCallback(async () => {
    try {
      const [analyticsData, teachersData, myEvals] = await Promise.all([
        getAnalytics(),
        getTeachers({
          program: program?.name,
          year: academicQuery?.year,
          semester: academicQuery?.semester
        }),
        getMyEvaluations()
      ]);
      setAnalytics(analyticsData);
      setStats({
        totalTeachers: teachersData.length,
        myEvaluations: myEvals.length,
      });
    } catch (e: any) {
      console.error('Error fetching dashboard data:', e);
      // Silently handle offline/network errors (data may come from cache)
      if (!e.message?.includes('Network Error') && !e.message?.includes('offline') && !e.message?.includes('timed out')) {
        // Only show alert for unexpected server errors
        console.warn('Unexpected dashboard error:', e.message);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [academicQuery, program]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleEditAcademic = () => {
    router.push('/academic-selection');
  };

  const QuickAction = ({ title, icon, onPress, color }: { title: string, icon: any, onPress: () => void, color: string }) => (
    <TouchableOpacity style={[styles.actionItem, { backgroundColor: theme.surface }]} onPress={onPress}>
      <View style={[styles.actionIcon, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={[styles.actionTitle, { color: theme.text }]}>{title}</Text>
    </TouchableOpacity>
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
      <StatusBar barStyle="light-content" backgroundColor={isDark ? theme.surface : "#0f172a"} />

      <View style={[styles.darkHeader, { backgroundColor: isDark ? theme.surface : '#0f172a' }]}>
        <View style={styles.headerTop}>
          <View style={styles.gradCapCircle}>
            <Ionicons name="school" size={24} color={theme.primaryLight} />
          </View>
          <View style={styles.headerTextGroup}>
            <Text style={styles.universityName}>{UNIVERSITY_NAME}</Text>
            <Text style={[styles.systemTitle, { color: isDark ? theme.textSecondary : '#94a3b8' }]}>Teacher Evaluation System</Text>
          </View>
          <TouchableOpacity style={styles.notificationBtn} onPress={() => router.push('/(student)/settings')}>
            <Ionicons name="notifications-outline" size={26} color="white" />
            {unreadCount > 0 && (
              <View style={[styles.badge, { backgroundColor: theme.error }]}>
                <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.greetingSection}>
          <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0]}</Text>
          <Text style={[styles.welcomeSubtitle, { color: isDark ? theme.textSecondary : '#94a3b8' }]}>Welcome back to your dashboard</Text>
        </View>
      </View>

      <ScrollView
        style={styles.contentScroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.scrollPadding}>
          {/* Academic Info Overlap Card */}
          <View style={[styles.academicCard, { backgroundColor: theme.surface }]}>
            <View style={styles.academicHeader}>
              <View style={[styles.collegeBadge, { backgroundColor: (college?.color || theme.primary) + '15' }]}>
                <Ionicons name={(college?.icon as any) || 'book'} size={24} color={college?.color || theme.primary} />
              </View>
              <View style={styles.academicInfo}>
                <Text style={[styles.collegeName, { color: theme.textSecondary }]}>{college?.shortName || 'Select College'}</Text>
                <Text style={[styles.programName, { color: theme.text }]}>{program?.name || 'Select Program'}</Text>
                <Text style={[styles.yearSemester, { color: theme.primary }]}>Year {academicQuery?.year} • Semester {academicQuery?.semester}</Text>
              </View>
            </View>
            <TouchableOpacity style={[styles.editBtn, { backgroundColor: theme.primary + '10' }]} onPress={handleEditAcademic}>
              <Ionicons name="create-outline" size={16} color={theme.primary} />
              <Text style={[styles.editBtnText, { color: theme.primary }]}>Edit Info</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Actions</Text>
            <View style={styles.actionsGrid}>
              <QuickAction
                title="Evaluate"
                icon="star"
                color={theme.primary}
                onPress={() => router.push('/(student)/teachers')}
              />
              <QuickAction
                title="History"
                icon="document-text"
                color="#ea580c"
                onPress={() => router.push('/(student)/evaluations')}
              />
              <QuickAction
                title="Profile"
                icon="person"
                color="#0891b2"
                onPress={() => router.push('/(student)/profile')}
              />
            </View>
          </View>

          {/* Analytics Highlight */}
          {analytics?.topCollege && (
            <View style={[
              styles.analyticsCard,
              {
                backgroundColor: isDark ? theme.surface : '#fffbeb',
                borderColor: isDark ? theme.border : '#fef3c7'
              }
            ]}>
              <Text style={[styles.analyticsLabel, { color: isDark ? theme.primary : '#92400e' }]}>🏆 Top Performing College</Text>
              <Text style={[styles.topCollegeName, { color: theme.text }]}>{analytics.topCollege.college}</Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={18} color="#f59e0b" />
                <Text style={[styles.avgRatingText, { color: theme.textSecondary }]}>{analytics.topCollege.averageRating} Avg. Rating</Text>
              </View>
            </View>
          )}

          {/* Overall Stats */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>University Overview</Text>
            <View style={styles.statsContainer}>
              <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
                <Ionicons name="people" size={32} color={theme.primary} style={styles.statIcon} />
                <Text style={[styles.statValue, { color: theme.text }]}>{stats.totalTeachers}</Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total Teachers</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
                <Ionicons name="checkmark-circle" size={32} color={theme.success} style={styles.statIcon} />
                <Text style={[styles.statValue, { color: theme.text }]}>{stats.myEvaluations}</Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>My Evaluations</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  darkHeader: {
    paddingTop: Platform.OS === 'ios' ? 60 : 44,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  gradCapCircle: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  headerTextGroup: { flex: 1 },
  universityName: { fontSize: 16, fontWeight: '800', color: '#f1f5f9' },
  systemTitle: { fontSize: 10, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5 },
  notificationBtn: { position: 'relative', width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  badge: { position: 'absolute', top: 0, right: 0, minWidth: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4 },
  badgeText: { color: 'white', fontSize: 10, fontWeight: '700' },
  greetingSection: { marginTop: 4 },
  greeting: { fontSize: 24, fontWeight: '700', color: '#fff' },
  welcomeSubtitle: { fontSize: 14, marginTop: 2, marginBottom: 10 },
  contentScroll: { flex: 1 },
  scrollPadding: { paddingBottom: 40 },
  academicCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 16,
    marginTop: 1,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  academicHeader: { flexDirection: 'row', alignItems: 'center' },
  collegeBadge: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  academicInfo: { flex: 1 },
  collegeName: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase' },
  programName: { fontSize: 16, fontWeight: '700', marginTop: 2 },
  yearSemester: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  editBtn: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end', padding: 8, borderRadius: 8, marginTop: 8 },
  editBtnText: { fontSize: 12, fontWeight: '700', marginLeft: 4 },
  section: { paddingHorizontal: 20, marginTop: 30 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 15 },
  actionsGrid: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  actionItem: { flex: 1, borderRadius: 16, padding: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  actionIcon: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  actionTitle: { fontSize: 12, fontWeight: '600', textAlign: 'center' },
  analyticsCard: {
    margin: 20, padding: 20, borderRadius: 20,
    borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  analyticsLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  topCollegeName: { fontSize: 24, fontWeight: '700', marginTop: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  avgRatingText: { fontSize: 16, fontWeight: '600', marginLeft: 6 },
  statsContainer: { flexDirection: 'row', gap: 12 },
  statCard: { flex: 1, padding: 16, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  statIcon: { marginBottom: 8 },
  statValue: { fontSize: 24, fontWeight: '700' },
  statLabel: { fontSize: 12, marginTop: 4 },
});

import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useNotifications } from '../../context/NotificationContext';
import { AdminStatCard } from '../../components/AdminStatCard';
import { HierarchicalFilters } from '../../components/Admin/HierarchicalFilters';
import { DataSection } from '../../components/Admin/DataSection';
import { getDashboardData, DashboardData, getOrganizedData, OrganizedData, getExportData } from '../../services/adminService';
import { exportToCSV } from '../../services/exportService';
import { COLLEGES, getCollegeById } from '../../constants/universityData';

export default function AdminDashboard() {
  const { theme, isDark } = useTheme();
  const { showNotification } = useNotifications();
  
  const [dashboardStats, setDashboardStats] = useState<DashboardData | null>(null);
  const [organizedData, setOrganizedData] = useState<OrganizedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Filter state (stores IDs for UI pickers)
  const [collegeId, setCollegeId] = useState('');
  const [programId, setProgramId] = useState('');
  const [year, setYear] = useState(0);
  const [semester, setSemester] = useState(0);

  // Resolve IDs to full names for backend queries
  const getResolvedFilters = () => {
    const college = collegeId ? getCollegeById(collegeId) : null;
    const program = college?.programs.find(p => p.id === programId);
    return {
      college: college?.name || undefined,
      program: program?.name || undefined,
      year: year || undefined,
      semester: semester || undefined,
    };
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const filters = getResolvedFilters();
      const [statsData, organized] = await Promise.all([
        getDashboardData(),
        getOrganizedData(filters)
      ]);
      setDashboardStats(statsData);
      setOrganizedData(organized);
    } catch (error: any) {
      console.error('Error fetching admin data:', error);
      showNotification('Error', 'Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [collegeId, programId, year, semester]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const filters = getResolvedFilters();
      const exportData = await getExportData(filters);

      if (!exportData || exportData.length === 0) {
        Alert.alert('No Data', 'No evaluations found for the selected filters.');
        return;
      }

      await exportToCSV(exportData, `EVA_Export_${new Date().getTime()}.csv`);
      showNotification('Success', 'Data exported successfully', 'success');
    } catch (error: any) {
      console.error('Export error:', error);
      console.error('Export error details:', error.response?.data || error.message);
      showNotification('Export Failed', 'Could not export data', 'error');
    } finally {
      setExporting(false);
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: theme.text }]}>Admin Panel</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>University Reporting & Analytics</Text>
        </View>
        <TouchableOpacity 
          style={[
            styles.exportButton, 
            { backgroundColor: theme.primary, opacity: exporting ? 0.6 : 1 }
          ]} 
          onPress={handleExport}
          disabled={exporting}
        >
          {exporting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="cloud-download-outline" size={20} color="white" />
              <Text style={styles.exportButtonText}>Export CSV</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Hierarchical Filters */}
        <HierarchicalFilters
          collegeId={collegeId}
          setCollegeId={setCollegeId}
          programId={programId}
          setProgramId={setProgramId}
          year={year}
          setYear={setYear}
          semester={semester}
          setSemester={setSemester}
        />

        {/* Global Stats Overview */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>System Stats</Text>
        </View>
        <View style={styles.statsGrid}>
          <AdminStatCard title="Teachers" value={dashboardStats?.stats.totalTeachers || 0} icon="people" color="#4338ca" />
          <AdminStatCard title="Students" value={dashboardStats?.stats.totalStudents || 0} icon="person" color="#10b981" />
          <AdminStatCard title="Evaluations" value={dashboardStats?.stats.totalEvaluations || 0} icon="document-text" color="#8b5cf6" />
          <AdminStatCard title="Avg Rating" value={dashboardStats?.stats.averageRating || '0.0'} icon="star" color="#f59e0b" />
        </View>

        {/* Organized Data Sections */}
        <DataSection
          title="Teachers"
          icon="people-outline"
          data={organizedData?.teachers || []}
          renderItem={({ item }) => (
            <View style={styles.dataItem}>
              <View style={styles.itemMain}>
                <Text style={[styles.itemName, { color: theme.text }]}>{item.name}</Text>
                <Text style={[styles.itemSub, { color: theme.textSecondary }]}>{item.courseName}</Text>
              </View>
              <View style={styles.itemBadge}>
                <Text style={[styles.badgeText, { color: theme.primary }]}>Y{item.year} S{item.semester}</Text>
              </View>
            </View>
          )}
        />

        <DataSection
          title="Registered Students"
          icon="person-outline"
          data={organizedData?.students || []}
          renderItem={({ item }) => (
            <View style={styles.dataItem}>
              <View style={styles.itemMain}>
                <Text style={[styles.itemName, { color: theme.text }]}>{item.name}</Text>
                <Text style={[styles.itemSub, { color: theme.textSecondary }]}>{item.email}</Text>
              </View>
              <View style={styles.itemBadge}>
                <Text style={[styles.badgeText, { color: theme.success }]}>{item.program || 'General'}</Text>
              </View>
            </View>
          )}
        />

        <DataSection
          title="Evaluations"
          icon="star-outline"
          data={organizedData?.evaluations || []}
          renderItem={({ item }) => (
            <View style={styles.evaluationItem}>
              <View style={styles.evalHeader}>
                <Text style={[styles.evalTitle, { color: theme.text }]}>{item.teacher?.name}</Text>
                <View style={[styles.ratingBadge, { backgroundColor: theme.primary + '15' }]}>
                  <Ionicons name="star" size={12} color={theme.warning} />
                  <Text style={[styles.ratingText, { color: theme.primary }]}>{item.rating}</Text>
                </View>
              </View>
              <Text style={[styles.evalStudent, { color: theme.textSecondary }]}>By: {item.student?.name}</Text>
              {item.comment ? (
                <Text style={[styles.evalComment, { color: theme.textSecondary }]} numberOfLines={2}>
                  "{item.comment}"
                </Text>
              ) : null}
              <Text style={[styles.evalDate, { color: theme.textSecondary }]}>
                {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </View>
          )}
        />
        
        <View style={styles.footerSpacer} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: { fontSize: 28, fontWeight: '800' },
  subtitle: { fontSize: 13, marginTop: 2 },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3
  },
  exportButtonText: { color: 'white', fontWeight: '700', fontSize: 14 },
  content: { padding: 20, paddingTop: 0 },
  sectionHeader: { marginBottom: 15, marginLeft: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 24 },
  dataItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  itemMain: { flex: 1 },
  itemName: { fontSize: 15, fontWeight: '700' },
  itemSub: { fontSize: 12, marginTop: 2 },
  itemBadge: { backgroundColor: 'rgba(0,0,0,0.05)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  evaluationItem: { paddingVertical: 14 },
  evalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  evalTitle: { fontSize: 15, fontWeight: '700' },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, gap: 4 },
  ratingText: { fontSize: 12, fontWeight: '700' },
  evalStudent: { fontSize: 12, marginBottom: 4 },
  evalComment: { fontSize: 13, fontStyle: 'italic', marginBottom: 6 },
  evalDate: { fontSize: 10, fontWeight: '600' },
  footerSpacer: { height: 60 }
});

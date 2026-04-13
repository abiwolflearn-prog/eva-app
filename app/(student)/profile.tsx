import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useAcademic } from '../../context/AcademicContext';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getCollegeById } from '../../constants/universityData';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { academicQuery, clearAcademicInfo } = useAcademic();
  const { theme, isDark } = useTheme();
  const router = useRouter();

  const college = academicQuery ? getCollegeById(academicQuery.collegeId) : null;
  const program = college?.programs.find(p => p.id === academicQuery?.programId);

  const handleChangeAcademic = async () => {
    router.replace('/academic-selection');
  };

  const handleLogout = async () => {
    await clearAcademicInfo();
    await signOut();
    router.replace('/login');
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.profileHeader, { backgroundColor: theme.surface }]}>
        <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
          <Text style={[styles.avatarText, { color: '#fff' }]}>{user?.name?.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={[styles.name, { color: theme.text }]}>{user?.name}</Text>
        <Text style={[styles.email, { color: theme.textSecondary }]}>{user?.email}</Text>
        <View style={[styles.roleBadge, { backgroundColor: theme.primary + '20' }]}>
          <Text style={[styles.roleText, { color: theme.primary }]}>{user?.role?.toUpperCase() || 'STUDENT'}</Text>
        </View>
      </View>

      {/* Academic Info */}
      {academicQuery && (
        <View style={styles.academicSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Academic Info</Text>
          <View style={[styles.academicCard, { backgroundColor: theme.surface }]}>
            <View style={styles.infoRow}>
              <Ionicons name="school-outline" size={20} color={theme.primary} />
              <View style={styles.infoText}>
                <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>College</Text>
                <Text style={[styles.infoValue, { color: theme.text }]}>{college?.name}</Text>
              </View>
            </View>
            <View style={[styles.separator, { backgroundColor: theme.border }]} />
            <View style={styles.infoRow}>
              <Ionicons name="library-outline" size={20} color={theme.primary} />
              <View style={styles.infoText}>
                <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Program</Text>
                <Text style={[styles.infoValue, { color: theme.text }]}>{program?.name}</Text>
              </View>
            </View>
            <View style={[styles.separator, { backgroundColor: theme.border }]} />
            <View style={styles.row}>
              <View style={[styles.infoRow, { flex: 1 }]}>
                <Ionicons name="calendar-outline" size={20} color={theme.primary} />
                <View style={styles.infoText}>
                  <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Year</Text>
                  <Text style={[styles.infoValue, { color: theme.text }]}>{academicQuery.year}</Text>
                </View>
              </View>
              <View style={[styles.infoRow, { flex: 1 }]}>
                <Ionicons name="time-outline" size={20} color={theme.primary} />
                <View style={styles.infoText}>
                  <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Semester</Text>
                  <Text style={[styles.infoValue, { color: theme.text }]}>{academicQuery.semester}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      )}

      <View style={styles.menu}>
        <TouchableOpacity style={[styles.menuItem, { backgroundColor: theme.surface, borderBottomColor: theme.border }]} onPress={handleChangeAcademic}>
          <Ionicons name="swap-horizontal-outline" size={24} color={theme.primary} />
          <Text style={[styles.menuText, { color: theme.primary }]}>Change Academic Info</Text>
          <Ionicons name="chevron-forward" size={20} color={theme.primary} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, { backgroundColor: theme.surface, borderBottomColor: theme.border }]} onPress={() => router.push('/(student)/evaluations')}>
          <Ionicons name="time-outline" size={24} color={theme.text} />
          <Text style={[styles.menuText, { color: theme.text }]}>Evaluation History</Text>
          <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.menuItem, { backgroundColor: theme.surface, borderBottomColor: theme.border }]} onPress={() => router.push('/(student)/settings')}>
          <Ionicons name="settings-outline" size={24} color={theme.text} />
          <Text style={[styles.menuText, { color: theme.text }]}>Settings</Text>
          <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, styles.logoutButton, { backgroundColor: theme.surface }]} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color={theme.error} />
          <Text style={[styles.menuText, { color: theme.error }]}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  profileHeader: { padding: 24, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  avatar: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  avatarText: { fontSize: 32, fontWeight: '700' },
  name: { fontSize: 24, fontWeight: '700' },
  email: { fontSize: 16, marginTop: 4 },
  roleBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginTop: 16 },
  roleText: { fontSize: 12, fontWeight: '700' },
  academicSection: { padding: 20, paddingBottom: 0 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  academicCard: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2
  },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start' },
  infoText: { marginLeft: 16, flex: 1 },
  infoLabel: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { fontSize: 16, fontWeight: '600', marginTop: 2 },
  separator: { height: 1, marginVertical: 16 },
  row: { flexDirection: 'row' },
  menu: { marginTop: 20 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 20, marginBottom: 1, borderBottomWidth: 1 },
  menuText: { flex: 1, fontSize: 16, marginLeft: 16 },
  logoutButton: { marginTop: 20, borderBottomWidth: 0 },
});

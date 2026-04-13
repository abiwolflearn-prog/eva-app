import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { getSystemSettings, updateSystemSettings, SystemSettings } from '../../services/adminService';

export default function AdminSettingsScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getSystemSettings();
      setSettings(data);
    } catch (error) {
      console.warn('API unavailable, using default settings');
      setSettings({ evaluationPeriodOpen: true, anonymousModeEnabled: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggle = async (key: keyof SystemSettings) => {
    if (!settings) return;
    const newVal = !settings[key];
    try {
      setSettings({ ...settings, [key]: newVal });
      await updateSystemSettings({ [key]: newVal });
    } catch (error) {
      Alert.alert('Error', 'Failed to update setting');
      setSettings({ ...settings, [key]: !newVal }); // Revert
    }
  };

  if (loading) return (
    <View style={[styles.centered, { backgroundColor: theme.background }]}>
      <ActivityIndicator size="large" color={theme.primary} />
    </View>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.section, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>System Control</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, { color: theme.text }]}>Evaluation Period</Text>
            <Text style={[styles.settingDesc, { color: theme.textSecondary }]}>When closed, students cannot submit new evaluations.</Text>
          </View>
          <Switch 
            value={settings?.evaluationPeriodOpen} 
            onValueChange={() => handleToggle('evaluationPeriodOpen')} 
            trackColor={{ false: '#767577', true: theme.primaryLight }}
            thumbColor={settings?.evaluationPeriodOpen ? theme.primary : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, { color: theme.text }]}>Anonymous Reviews</Text>
            <Text style={[styles.settingDesc, { color: theme.textSecondary }]}>Allow students to hide their identities during evaluation.</Text>
          </View>
          <Switch 
            value={settings?.anonymousModeEnabled} 
            onValueChange={() => handleToggle('anonymousModeEnabled')}
            trackColor={{ false: '#767577', true: theme.primaryLight }}
            thumbColor={settings?.anonymousModeEnabled ? theme.primary : '#f4f3f4'}
          />
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Appearance</Text>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, { color: theme.text }]}>Dark Mode</Text>
            <Text style={[styles.settingDesc, { color: theme.textSecondary }]}>Switch between light and dark themes.</Text>
          </View>
          <Switch 
            value={isDark} 
            onValueChange={toggleTheme}
            trackColor={{ false: '#767577', true: theme.primaryLight }}
            thumbColor={isDark ? theme.primary : '#f4f3f4'}
          />
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Security & Access</Text>
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="shield-checkmark" size={24} color={theme.primary} />
          <View style={styles.menuText}>
            <Text style={[styles.menuLabel, { color: theme.text }]}>Change Admin Password</Text>
            <Text style={[styles.menuDesc, { color: theme.textSecondary }]}>Update your security credentials</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="list" size={24} color={theme.primary} />
          <View style={styles.menuText}>
            <Text style={[styles.menuLabel, { color: theme.text }]}>Activity Logs</Text>
            <Text style={[styles.menuDesc, { color: theme.textSecondary }]}>View system-wide activity history</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.dangerZone}>
        <Text style={[styles.sectionTitle, { color: theme.error }]}>Danger Zone</Text>
        <TouchableOpacity style={[styles.dangerButton, { borderColor: theme.error }]} onPress={() => Alert.alert('Maintenance Mode', 'Maintenance mode activated.')}>
          <Text style={[styles.dangerButtonText, { color: theme.error }]}>Enter Maintenance Mode</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  section: { padding: 20, marginBottom: 12, borderBottomWidth: 1 },
  sectionTitle: { fontSize: 14, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 20 },
  settingItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  settingInfo: { flex: 1, marginRight: 16 },
  settingLabel: { fontSize: 16, fontWeight: '700' },
  settingDesc: { fontSize: 12, marginTop: 4 },
  menuItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  menuText: { flex: 1, marginLeft: 16 },
  menuLabel: { fontSize: 16, fontWeight: '700' },
  menuDesc: { fontSize: 12, marginTop: 2 },
  dangerZone: { padding: 20, marginTop: 12 },
  dangerButton: { borderWidth: 1, borderRadius: 12, padding: 16, alignItems: 'center' },
  dangerButtonText: { fontWeight: '700' },
});

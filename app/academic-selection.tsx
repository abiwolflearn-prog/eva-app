import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { COLLEGES } from '../constants/universityData';
import { useAcademic } from '../context/AcademicContext';
import { Ionicons } from '@expo/vector-icons';
import { CustomButton } from '../components/CustomButton';
import { Picker } from '@react-native-picker/picker';

export default function AcademicSelectionScreen() {
  const router = useRouter();
  const { setAcademicInfo } = useAcademic();
  const { theme, isDark } = useTheme();
  
  const [collegeId, setCollegeId] = useState('');
  const [programId, setProgramId] = useState('');
  const [year, setYear] = useState(1);
  const [semester, setSemester] = useState(1);

  const selectedCollege = COLLEGES.find(c => c.id === collegeId);
  const programs = selectedCollege ? selectedCollege.programs : [];

  const handleContinue = async () => {
    if (!collegeId || !programId) return;
    
    await setAcademicInfo({
      collegeId,
      programId,
      year,
      semester
    });
    
    router.replace('/(student)/home');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.primary }]}>Academic Info</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Select your current academic details to see relevant teachers.</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.text }]}>College</Text>
          <View style={[styles.pickerContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Picker
              selectedValue={collegeId}
              onValueChange={(itemValue: string) => {
                setCollegeId(itemValue);
                setProgramId('');
              }}
              style={[styles.picker, { color: theme.text }]}
              dropdownIconColor={theme.text}
            >
              <Picker.Item label="Select College" value="" color={isDark ? '#94a3b8' : undefined} />
              {COLLEGES.map(c => (
                <Picker.Item key={c.id} label={c.name} value={c.id} color={theme.text} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.text }]}>Program</Text>
          <View style={[styles.pickerContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Picker
              selectedValue={programId}
              onValueChange={(itemValue: string) => setProgramId(itemValue)}
              enabled={!!collegeId}
              style={[styles.picker, { color: theme.text }]}
              dropdownIconColor={theme.text}
            >
              <Picker.Item label="Select Program" value="" color={isDark ? '#94a3b8' : undefined} />
              {programs.map(p => (
                <Picker.Item key={p.id} label={p.name} value={p.id} color={theme.text} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.section, { flex: 1, marginRight: 8 }]}>
            <Text style={[styles.label, { color: theme.text }]}>Academic Year</Text>
            <View style={[styles.pickerContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Picker
                selectedValue={year}
                onValueChange={(itemValue: number) => setYear(itemValue)}
                style={[styles.picker, { color: theme.text }]}
                dropdownIconColor={theme.text}
              >
                {[1, 2, 3, 4, 5].map(y => (
                  <Picker.Item key={y} label={`Year ${y}`} value={y} color={theme.text} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={[styles.section, { flex: 1, marginLeft: 8 }]}>
            <Text style={[styles.label, { color: theme.text }]}>Semester</Text>
            <View style={[styles.pickerContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Picker
                selectedValue={semester}
                onValueChange={(itemValue: number) => setSemester(itemValue)}
                style={[styles.picker, { color: theme.text }]}
                dropdownIconColor={theme.text}
              >
                {[1, 2].map(s => (
                  <Picker.Item key={s} label={`Semester ${s}`} value={s} color={theme.text} />
                ))}
              </Picker>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <CustomButton
            title="Continue to Dashboard"
            onPress={handleContinue}
            disabled={!collegeId || !programId}
            icon="arrow-forward"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 24 },
  header: { marginBottom: 32, marginTop: 20 },
  title: { fontSize: 32, fontWeight: '700', marginBottom: 4 },
  subtitle: { fontSize: 16 },
  section: { marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginLeft: 4 },
  pickerContainer: {
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2
  },
  picker: { height: 50, width: '100%' },
  row: { flexDirection: 'row' },
  footer: { marginTop: 32, marginBottom: 40 },
});

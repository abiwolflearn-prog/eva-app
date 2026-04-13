import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { COLLEGES } from '../../constants/universityData';
import { useTheme } from '../../context/ThemeContext';

interface HierarchicalFiltersProps {
  collegeId: string;
  setCollegeId: (id: string) => void;
  programId: string;
  setProgramId: (id: string) => void;
  year: number;
  setYear: (year: number) => void;
  semester: number;
  setSemester: (semester: number) => void;
}

export const HierarchicalFilters: React.FC<HierarchicalFiltersProps> = ({
  collegeId,
  setCollegeId,
  programId,
  setProgramId,
  year,
  setYear,
  semester,
  setSemester,
}) => {
  const { theme, isDark } = useTheme();
  const selectedCollege = COLLEGES.find((c) => c.id === collegeId);
  const programs = selectedCollege ? selectedCollege.programs : [];

  return (
    <View style={[styles.container, { backgroundColor: theme.surface }]}>
      <Text style={[styles.title, { color: theme.text }]}>Data Filters</Text>
      
      <View style={styles.filterRow}>
        <View style={styles.filterHalf}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>College</Text>
          <View style={[styles.pickerContainer, { borderColor: theme.border }]}>
            <Picker
              selectedValue={collegeId}
              onValueChange={(val) => {
                setCollegeId(val);
                setProgramId('');
              }}
              style={{ color: theme.text }}
              dropdownIconColor={theme.text}
            >
              <Picker.Item label="All Colleges" value="" color={isDark ? '#94a3b8' : undefined} />
              {COLLEGES.map((c) => (
                <Picker.Item key={c.id} label={c.name} value={c.id} color={theme.text} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.filterHalf}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Program</Text>
          <View style={[styles.pickerContainer, { borderColor: theme.border, opacity: collegeId ? 1 : 0.5 }]}>
            <Picker
              selectedValue={programId}
              onValueChange={(val) => setProgramId(val)}
              enabled={!!collegeId}
              style={{ color: theme.text }}
              dropdownIconColor={theme.text}
            >
              <Picker.Item label="All Programs" value="" color={isDark ? '#94a3b8' : undefined} />
              {programs.map((p) => (
                <Picker.Item key={p.id} label={p.name} value={p.id} color={theme.text} />
              ))}
            </Picker>
          </View>
        </View>
      </View>

      <View style={styles.filterRow}>
        <View style={styles.filterHalf}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Year</Text>
          <View style={[styles.pickerContainer, { borderColor: theme.border }]}>
            <Picker
              selectedValue={year}
              onValueChange={(val) => setYear(Number(val))}
              style={{ color: theme.text }}
              dropdownIconColor={theme.text}
            >
              <Picker.Item label="All Years" value={0} color={isDark ? '#94a3b8' : undefined} />
              {[1, 2, 3, 4, 5].map((y) => (
                <Picker.Item key={y} label={`Year ${y}`} value={y} color={theme.text} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.filterHalf}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Semester</Text>
          <View style={[styles.pickerContainer, { borderColor: theme.border }]}>
            <Picker
              selectedValue={semester}
              onValueChange={(val) => setSemester(Number(val))}
              style={{ color: theme.text }}
              dropdownIconColor={theme.text}
            >
              <Picker.Item label="All Semesters" value={0} color={isDark ? '#94a3b8' : undefined} />
              {[1, 2].map((s) => (
                <Picker.Item key={s} label={`Semester ${s}`} value={s} color={theme.text} />
              ))}
            </Picker>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2
  },
  title: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  filterRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  filterHalf: { flex: 1 },
  label: { fontSize: 12, fontWeight: '600', marginBottom: 4, marginLeft: 4 },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    height: 44,
    justifyContent: 'center',
    overflow: 'hidden'
  }
});

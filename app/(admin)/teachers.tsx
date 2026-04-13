import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, Modal, TextInput, ScrollView, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { getTeachers } from '../../services/teacherService';
import { createTeacher, updateTeacher, deleteTeacher } from '../../services/adminService';
import { Teacher } from '../../types';
import { COLLEGES } from '../../constants/universityData';

export default function AdminTeachersScreen() {
  const { theme, isDark } = useTheme();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [courseName, setCourseName] = useState('');
  const [collegeId, setCollegeId] = useState('');
  const [programId, setProgramId] = useState('');
  const [year, setYear] = useState('1');
  const [semester, setSemester] = useState('1');

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getTeachers({});
      setTeachers(data);
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

  const resetForm = () => {
    setName('');
    setCourseName('');
    setCollegeId('');
    setProgramId('');
    setYear('1');
    setSemester('1');
    setEditingTeacher(null);
  };

  const handleEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setName(teacher.name);
    setCourseName(teacher.courseName);
    const college = COLLEGES.find(c => c.name === teacher.college);
    setCollegeId(college?.id || '');
    const program = college?.programs.find(p => p.name === teacher.program);
    setProgramId(program?.id || '');
    setYear(teacher.year.toString());
    setSemester(teacher.semester.toString());
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    if (!name || !courseName || !collegeId || !programId) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const college = COLLEGES.find(c => c.id === collegeId);
    const program = college?.programs.find(p => p.id === programId);

    const payload = {
      name,
      courseName,
      college: college?.name || '',
      program: program?.name || '',
      year: parseInt(year),
      semester: parseInt(semester),
    };

    try {
      if (editingTeacher) {
        await updateTeacher(editingTeacher._id, payload);
        Alert.alert('Success', 'Teacher updated successfully');
      } else {
        await createTeacher(payload);
        Alert.alert('Success', 'Teacher created successfully');
      }
      setModalVisible(false);
      resetForm();
      fetchData();
    } catch (error) {
      Alert.alert('Error', 'Failed to save teacher');
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Teacher', 'Are you sure? This will delete all evaluations for this teacher.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await deleteTeacher(id);
          fetchData();
        } catch (error) {
          Alert.alert('Error', 'Failed to delete teacher');
        }
      }},
    ]);
  };

  const renderTeacherItem = ({ item }: { item: Teacher }) => (
    <View style={[styles.card, { backgroundColor: theme.surface }]}>
      <View style={styles.cardContent}>
        <Text style={[styles.teacherName, { color: theme.text }]}>{item.name}</Text>
        <Text style={[styles.teacherCourse, { color: theme.primary }]}>{item.courseName}</Text>
        <Text style={[styles.teacherDept, { color: theme.textSecondary }]}>{item.college} • {item.program}</Text>
        <Text style={[styles.teacherAcademic, { color: theme.textSecondary }]}>Year {item.year} • Sem {item.semester}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => handleEdit(item)} style={styles.actionBtn}>
          <Ionicons name="pencil" size={20} color={theme.primary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item._id)} style={styles.actionBtn}>
          <Ionicons name="trash" size={20} color={theme.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <TouchableOpacity 
        style={[styles.addButton, { backgroundColor: theme.primary }]} 
        onPress={() => { resetForm(); setModalVisible(true); }}
      >
        <Ionicons name="add" size={24} color="#fff" />
        <Text style={styles.addButtonText}>Add New Teacher</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={teachers}
          keyExtractor={(item) => item._id}
          renderItem={renderTeacherItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={() => <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No teachers found</Text>}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={true}
        />
      )}

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>{editingTeacher ? 'Edit Teacher' : 'Add Teacher'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.form}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Full Name</Text>
              <TextInput 
                style={[styles.input, { backgroundColor: theme.background, color: theme.text }]} 
                value={name} 
                onChangeText={setName} 
                placeholder="Dr. John Doe"
                placeholderTextColor={theme.textSecondary}
              />

              <Text style={[styles.label, { color: theme.textSecondary }]}>Course Name</Text>
              <TextInput 
                style={[styles.input, { backgroundColor: theme.background, color: theme.text }]} 
                value={courseName} 
                onChangeText={setCourseName} 
                placeholder="Introduction to CS"
                placeholderTextColor={theme.textSecondary}
              />

              <Text style={[styles.label, { color: theme.textSecondary }]}>College</Text>
              <View style={styles.pickerContainer}>
                {COLLEGES.map((c) => (
                  <TouchableOpacity 
                    key={c.id} 
                    style={[
                      styles.pickerItem, 
                      { borderColor: theme.border },
                      collegeId === c.id && { backgroundColor: theme.primary, borderColor: theme.primary }
                    ]}
                    onPress={() => { setCollegeId(c.id); setProgramId(''); }}
                  >
                    <Text style={[
                      styles.pickerText, 
                      { color: theme.textSecondary },
                      collegeId === c.id && { color: '#fff', fontWeight: 'bold' }
                    ]}>{c.shortName}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {collegeId && (
                <>
                  <Text style={[styles.label, { color: theme.textSecondary }]}>Program</Text>
                  <View style={styles.pickerContainer}>
                    {COLLEGES.find(c => c.id === collegeId)?.programs.map((p) => (
                      <TouchableOpacity 
                        key={p.id} 
                        style={[
                          styles.pickerItem, 
                          { borderColor: theme.border },
                          programId === p.id && { backgroundColor: theme.primary, borderColor: theme.primary }
                        ]}
                        onPress={() => setProgramId(p.id)}
                      >
                        <Text style={[
                          styles.pickerText, 
                          { color: theme.textSecondary },
                          programId === p.id && { color: '#fff', fontWeight: 'bold' }
                        ]}>{p.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

              <View style={{ flexDirection: 'row', gap: 16 }}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.label, { color: theme.textSecondary }]}>Academic Year</Text>
                  <View style={styles.pickerContainer}>
                    {['1', '2', '3', '4', '5'].map((y) => (
                      <TouchableOpacity 
                        key={y} 
                        style={[
                          styles.pickerItem, 
                          { borderColor: theme.border },
                          year === y && { backgroundColor: theme.primary, borderColor: theme.primary }
                        ]}
                        onPress={() => setYear(y)}
                      >
                        <Text style={[
                          styles.pickerText, 
                          { color: theme.textSecondary },
                          year === y && { color: '#fff', fontWeight: 'bold' }
                        ]}>{y}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.label, { color: theme.textSecondary }]}>Semester</Text>
                  <View style={styles.pickerContainer}>
                    {['1', '2'].map((s) => (
                      <TouchableOpacity 
                        key={s} 
                        style={[
                          styles.pickerItem, 
                          { borderColor: theme.border },
                          semester === s && { backgroundColor: theme.primary, borderColor: theme.primary }
                        ]}
                        onPress={() => setSemester(s)}
                      >
                        <Text style={[
                          styles.pickerText, 
                          { color: theme.textSecondary },
                          semester === s && { color: '#fff', fontWeight: 'bold' }
                        ]}>{s}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              <TouchableOpacity style={[styles.submitBtn, { backgroundColor: theme.primary }]} onPress={handleSubmit}>
                <Text style={styles.submitBtnText}>Save Teacher</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16 },
  card: { borderRadius: 12, padding: 16, marginBottom: 8, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  cardContent: { flex: 1 },
  teacherName: { fontSize: 16, fontWeight: '700' },
  teacherCourse: { fontSize: 14, fontWeight: '600', marginTop: 2 },
  teacherDept: { fontSize: 12, marginTop: 2 },
  teacherAcademic: { fontSize: 10, marginTop: 2 },
  actions: { flexDirection: 'row' },
  actionBtn: { padding: 8, marginLeft: 8 },
  addButton: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, margin: 16, justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  addButtonText: { color: '#fff', fontWeight: '700', marginLeft: 8 },
  emptyText: { textAlign: 'center', marginTop: 40 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, height: '80%', padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 24, fontWeight: '700' },
  form: { flex: 1 },
  label: { fontSize: 12, marginBottom: 8, marginTop: 16, fontWeight: '600' },
  input: { borderRadius: 8, padding: 12, fontSize: 16 },
  pickerContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  pickerItem: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  pickerText: { fontSize: 12 },
  submitBtn: { padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 32, marginBottom: 20 },
  submitBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});

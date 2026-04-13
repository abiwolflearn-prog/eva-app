import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView, Alert, StatusBar } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { InputField } from '../components/InputField';
import { CustomButton } from '../components/CustomButton';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { register } from '../services/authService';
import { Ionicons } from '@expo/vector-icons';

import { COLLEGES } from '../constants/universityData';
import { Picker } from '@react-native-picker/picker';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [collegeId, setCollegeId] = useState('');
  const [programId, setProgramId] = useState('');
  const [year, setYear] = useState(1);
  const [semester, setSemester] = useState(1);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const { theme, isDark } = useTheme();
  const router = useRouter();

  const selectedCollege = COLLEGES.find(c => c.id === collegeId);
  const programs = selectedCollege ? selectedCollege.programs : [];

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword || !collegeId || !programId) {
      Alert.alert('Error', 'Please fill in all fields including College and Program');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const user = await register(
        name, 
        email, 
        password, 
        'student',
        selectedCollege?.name,
        programs.find(p => p.id === programId)?.name,
        year,
        semester
      );
      Alert.alert(
        'Registration Successful',
        'Registration successfully!',
        [{ 
          text: 'OK', 
          onPress: () => {
            signIn(user).then(() => router.replace('/(student)/home'));
          }
        }]
      );
    } catch (e: any) {
      let errorMessage = 'Something went wrong';
      if (e.message?.includes('Network Error') || e.message?.includes('Cannot reach')) {
        errorMessage = 'Cannot connect to server. Please check your internet connection.';
      } else if (e.message?.includes('timed out')) {
        errorMessage = 'Connection timed out. Please try again.';
      } else if (e.message) {
        errorMessage = e.message;
      } else if (e.response?.data?.message) {
        errorMessage = e.response.data.message;
      }
      Alert.alert('Registration Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? theme.background : '#0f172a' }]}>
      <StatusBar barStyle="light-content" backgroundColor={isDark ? theme.surface : "#0f172a"} />

      {/* Header */}
      <View style={[styles.darkHeader, { backgroundColor: isDark ? theme.surface : '#0f172a' }]}>
        <View style={[styles.gradCapCircle, { backgroundColor: isDark ? theme.background : '#1e293b', borderColor: isDark ? theme.border : '#334155' }]}>
          <Ionicons name="school" size={32} color={theme.primary} />
        </View>
        <Text style={[styles.universityName, { color: isDark ? theme.text : '#f1f5f9' }]}>Wachemo University</Text>
        <Text style={[styles.systemTitle, { color: isDark ? theme.textSecondary : '#94a3b8' }]}>Teacher Evaluation System</Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[styles.formArea, { backgroundColor: theme.background }]}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={[styles.form, { backgroundColor: theme.surface }]}>
            <Text style={[styles.formTitle, { color: theme.text }]}>Create Account</Text>
            <Text style={[styles.formSubtitle, { color: theme.textSecondary }]}>Join EVA to start evaluating teachers</Text>

            <InputField label="Full Name" icon="person-outline" placeholder="Abel Bimrew" value={name} onChangeText={setName} />
            <InputField label="Email Address" icon="mail-outline" placeholder="Abel@wcu.edu.et" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />

            <View style={styles.pickerSection}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>College</Text>
              <View style={[styles.pickerContainer, { backgroundColor: isDark ? theme.background : '#f8fafc', borderColor: theme.border }]}>
                <Picker
                  selectedValue={collegeId}
                  onValueChange={(val) => { setCollegeId(val); setProgramId(''); }}
                  style={{ color: theme.text }}
                  dropdownIconColor={theme.text}
                >
                  <Picker.Item label="Select College" value="" color={isDark ? '#94a3b8' : undefined} />
                  {COLLEGES.map(c => <Picker.Item key={c.id} label={c.name} value={c.id} />)}
                </Picker>
              </View>
            </View>

            <View style={styles.pickerSection}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Program</Text>
              <View style={[styles.pickerContainer, { backgroundColor: isDark ? theme.background : '#f8fafc', borderColor: theme.border, opacity: collegeId ? 1 : 0.5 }]}>
                <Picker
                  selectedValue={programId}
                  onValueChange={(val) => setProgramId(val)}
                  enabled={!!collegeId}
                  style={{ color: theme.text }}
                  dropdownIconColor={theme.text}
                >
                  <Picker.Item label="Select Program" value="" color={isDark ? '#94a3b8' : undefined} />
                  {programs.map(p => <Picker.Item key={p.id} label={p.name} value={p.id} />)}
                </Picker>
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.pickerSection, { flex: 1, marginRight: 8 }]}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Year</Text>
                <View style={[styles.pickerContainer, { backgroundColor: isDark ? theme.background : '#f8fafc', borderColor: theme.border }]}>
                  <Picker
                    selectedValue={year}
                    onValueChange={(val) => setYear(val)}
                    style={{ color: theme.text }}
                    dropdownIconColor={theme.text}
                  >
                    {[1, 2, 3, 4, 5].map(y => <Picker.Item key={y} label={`Year ${y}`} value={y} />)}
                  </Picker>
                </View>
              </View>
              <View style={[styles.pickerSection, { flex: 1, marginLeft: 8 }]}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Semester</Text>
                <View style={[styles.pickerContainer, { backgroundColor: isDark ? theme.background : '#f8fafc', borderColor: theme.border }]}>
                  <Picker
                    selectedValue={semester}
                    onValueChange={(val) => setSemester(val)}
                    style={{ color: theme.text }}
                    dropdownIconColor={theme.text}
                  >
                    {[1, 2].map(s => <Picker.Item key={s} label={`Sem ${s}`} value={s} />)}
                  </Picker>
                </View>
              </View>
            </View>

            <InputField label="Password" icon="lock-closed-outline" placeholder="••••••••" secureTextEntry value={password} onChangeText={setPassword} />
            <InputField label="Confirm Password" icon="lock-closed-outline" placeholder="••••••••" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />

            <CustomButton title="Register" onPress={handleRegister} loading={loading} style={styles.button} />

            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: theme.textSecondary }]}>Already have an account? </Text>
              <Link href="/login" asChild>
                <TouchableOpacity>
                  <Text style={[styles.link, { color: theme.primary }]}>Login</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  darkHeader: {
    paddingTop: Platform.OS === 'ios' ? 56 : 44,
    paddingBottom: 24,
    alignItems: 'center',
  },
  gradCapCircle: {
    width: 64, height: 64, borderRadius: 32,
    justifyContent: 'center', alignItems: 'center', borderWidth: 2,
    marginBottom: 12,
  },
  universityName: { fontSize: 20, fontWeight: '800', letterSpacing: 0.5 },
  systemTitle: { fontSize: 12, fontWeight: '500', marginTop: 4, letterSpacing: 1, textTransform: 'uppercase' },
  formArea: { flex: 1, borderTopLeftRadius: 28, borderTopRightRadius: 28, marginTop: -10 },
  scroll: { padding: 24, paddingTop: 34, paddingBottom: 40 },
  form: { padding: 24, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 4 },
  formTitle: { fontSize: 24, fontWeight: '700', marginBottom: 4 },
  formSubtitle: { fontSize: 14, marginBottom: 24 },
  button: { marginTop: 16 },
  pickerSection: { marginBottom: 16 },
  pickerContainer: { borderWidth: 1, borderRadius: 12, height: 50, justifyContent: 'center', overflow: 'hidden' },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6, marginLeft: 4 },
  row: { flexDirection: 'row' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 32 },
  footerText: { fontSize: 16 },
  link: { fontSize: 16, fontWeight: '700' },
});

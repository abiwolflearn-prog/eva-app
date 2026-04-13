import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, Alert, ScrollView, StatusBar } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { InputField } from '../components/InputField';
import { CustomButton } from '../components/CustomButton';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { login } from '../services/authService';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const { signIn } = useAuth();
  const { theme, isDark } = useTheme();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      
      // Use a timeout to show the "Server waking up" message if it takes too long
      const wakeUpTimer = setTimeout(() => {
        setStatusMessage('Server waking up, please wait...');
      }, 5000);

      const user = await login(email, password);
      clearTimeout(wakeUpTimer);
      setStatusMessage('');
      
      await signIn(user);
      if (user.role === 'admin') {
        router.replace('/(admin)/dashboard');
      } else {
        router.replace('/(student)/home');
      }
    } catch (e: any) {
      // The API service now returns descriptive errors
      const errorMessage = e.message || 'An unexpected error occurred';
      
      // Check for specific Render cold start context
      const title = errorMessage.includes('waking up') ? 'Server Waking Up' : 'Login Failed';
      
      Alert.alert(title, errorMessage);
    } finally {
      setLoading(false);
      setStatusMessage('');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? theme.background : '#0f172a' }]}>
      <StatusBar barStyle="light-content" backgroundColor={isDark ? theme.surface : "#0f172a"} />

      {/* Header with University Branding */}
      <View style={[styles.darkHeader, { backgroundColor: isDark ? theme.surface : '#0f172a' }]}>
        <View style={styles.gradCapContainer}>
          <View style={[styles.gradCapCircle, { backgroundColor: isDark ? theme.background : '#1e293b', borderColor: isDark ? theme.border : '#334155' }]}>
            <Ionicons name="school" size={40} color={theme.primary} />
          </View>
        </View>
        <Text style={[styles.universityName, { color: isDark ? theme.text : '#f1f5f9' }]}>Wachemo University</Text>
        <Text style={[styles.systemTitle, { color: isDark ? theme.textSecondary : '#94a3b8' }]}>Teacher Evaluation System</Text>
        <View style={[styles.evaTag, { backgroundColor: theme.primary }]}>
          <Text style={styles.evaTagText}>EVA</Text>
        </View>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[styles.formArea, { backgroundColor: theme.background }]}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={[styles.form, { backgroundColor: theme.surface }]}>
            <Text style={[styles.formTitle, { color: theme.text }]}>Sign In</Text>
            <Text style={[styles.formSubtitle, { color: theme.textSecondary }]}>Enter your credentials to continue</Text>

            <InputField
              label="Email Address"
              icon="mail-outline"
              placeholder="abel@wcu.edu.et"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
            <InputField
              label="Password"
              icon="lock-closed-outline"
              placeholder="••••••••"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <CustomButton title="Login" onPress={handleLogin} loading={loading} style={styles.button} />

            {statusMessage ? <Text style={[styles.statusMessage, { color: theme.primary }]}>{statusMessage}</Text> : null}

            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: theme.textSecondary }]}>Don't have an account? </Text>
              <Link href="/register" asChild>
                <TouchableOpacity>
                  <Text style={[styles.link, { color: theme.primary }]}>Sign Up</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  darkHeader: {
    paddingTop: Platform.OS === 'ios' ? 60 : 48,
    paddingBottom: 28,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  gradCapContainer: { marginBottom: 16 },
  gradCapCircle: {
    width: 80, height: 80, borderRadius: 40,
    justifyContent: 'center', alignItems: 'center', borderWidth: 2,
  },
  universityName: { fontSize: 22, fontWeight: '800', letterSpacing: 0.5 },
  systemTitle: { fontSize: 13, fontWeight: '500', marginTop: 4, letterSpacing: 1, textTransform: 'uppercase' },
  evaTag: { marginTop: 10, paddingHorizontal: 16, paddingVertical: 4, borderRadius: 20 },
  evaTagText: { color: '#fff', fontSize: 12, fontWeight: '800', letterSpacing: 2 },
  formArea: { flex: 1, borderTopLeftRadius: 28, borderTopRightRadius: 28, marginTop: -10 },
  scrollContent: { padding: 24, paddingTop: 34, paddingBottom: 40 },
  form: { padding: 24, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 4 },
  formTitle: { fontSize: 24, fontWeight: '700', marginBottom: 4 },
  formSubtitle: { fontSize: 14, marginBottom: 24 },
  button: { marginTop: 16 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 32 },
  footerText: { fontSize: 16 },
  link: { fontSize: 16, fontWeight: '700' },
  statusMessage: {
    marginTop: 12,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
});

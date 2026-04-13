import React from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface InputFieldProps extends TextInputProps {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  error?: string;
}

export const InputField: React.FC<InputFieldProps> = ({ label, icon, error, ...props }) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
      <View style={[
        styles.inputContainer, 
        { 
          backgroundColor: theme.surface, 
          borderColor: error ? theme.error : theme.border 
        }
      ]}>
        {icon && <Ionicons name={icon} size={20} color={theme.textSecondary} style={styles.icon} />}
        <TextInput
          style={[styles.input, { color: theme.text }]}
          placeholderTextColor={theme.textSecondary}
          {...props}
        />
      </View>
      {error ? <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { fontSize: 14, marginBottom: 8, fontWeight: '600' },
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderRadius: 12, 
    borderWidth: 1, 
    paddingHorizontal: 16, 
    height: 50 
  },
  icon: { marginRight: 8 },
  input: { flex: 1, fontSize: 16 },
  errorText: { fontSize: 12, marginTop: 4 }
});

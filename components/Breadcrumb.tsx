import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface BreadcrumbItem {
  label: string;
  onPress?: () => void;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  const { theme } = useTheme();

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false} 
      style={[styles.container, { backgroundColor: theme.surface, borderBottomColor: theme.border }]} 
      contentContainerStyle={styles.content}
    >
      {items.map((item, index) => (
        <View key={index} style={styles.itemRow}>
          {index > 0 && (
            <Ionicons name="chevron-forward" size={14} color={theme.textSecondary} style={styles.separator} />
          )}
          {item.onPress ? (
            <TouchableOpacity onPress={item.onPress}>
              <Text style={[styles.linkText, { color: theme.primary }]}>{item.label}</Text>
            </TouchableOpacity>
          ) : (
            <Text style={[styles.activeText, { color: theme.textSecondary }]}>{item.label}</Text>
          )}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    maxHeight: 44,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  separator: {
    marginHorizontal: 4,
  },
  linkText: {
    fontSize: 12,
    fontWeight: '600',
  },
  activeText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

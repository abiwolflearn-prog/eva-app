import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

interface DataSectionProps {
  title: string;
  icon: any;
  data: any[];
  renderItem: ({ item }: { item: any }) => React.ReactElement;
  emptyMessage?: string;
}

export const DataSection: React.FC<DataSectionProps> = ({
  title,
  icon,
  data,
  renderItem,
  emptyMessage = 'No records found for the selected filters.'
}) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name={icon} size={20} color={theme.primary} />
        <Text style={[styles.title, { color: theme.text }]}>{title} ({data.length})</Text>
      </View>
      
      {data.length > 0 ? (
        <View style={[styles.listContainer, { backgroundColor: theme.surface }]}>
          {data.map((item, index) => (
            <View key={item._id || index}>
              {renderItem({ item })}
              {index < data.length - 1 && <View style={[styles.separator, { backgroundColor: theme.border }]} />}
            </View>
          ))}
        </View>
      ) : (
        <View style={[styles.emptyContainer, { backgroundColor: theme.surface }]}>
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>{emptyMessage}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 24 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, marginLeft: 4 },
  title: { fontSize: 18, fontWeight: '700', marginLeft: 10 },
  listContainer: { borderRadius: 12, overflow: 'hidden', paddingHorizontal: 16 },
  separator: { height: 1, width: '100%' },
  emptyContainer: { padding: 24, borderRadius: 12, alignItems: 'center' },
  emptyText: { fontSize: 14, fontStyle: 'italic' }
});

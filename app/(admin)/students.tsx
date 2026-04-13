import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { getAllUsers, toggleUserRole, deleteUser } from '../../services/adminService';
import { User } from '../../types';
import { useAuth } from '../../context/AuthContext';

export default function AdminStudentsScreen() {
  const { theme, isDark } = useTheme();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user: currentUser } = useAuth();

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      setUsers(data);
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

  const handleToggleRole = async (userId: string) => {
    if (userId === currentUser?._id) {
      Alert.alert('Error', 'You cannot change your own role');
      return;
    }
    try {
      await toggleUserRole(userId);
      fetchData();
    } catch (error) {
      Alert.alert('Error', 'Failed to update user role');
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (userId === currentUser?._id) {
      Alert.alert('Error', 'You cannot delete yourself');
      return;
    }
    Alert.alert('Delete User', 'Are you sure you want to delete this user?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await deleteUser(userId);
          fetchData();
        } catch (error) {
          Alert.alert('Error', 'Failed to delete user');
        }
      }},
    ]);
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <View style={[styles.card, { backgroundColor: theme.surface }]}>
      <View style={[styles.avatar, { backgroundColor: theme.border }]}>
        <Text style={[styles.avatarText, { color: theme.textSecondary }]}>{item.name.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={styles.info}>
        <Text style={[styles.userName, { color: theme.text }]}>{item.name}</Text>
        <Text style={[styles.userEmail, { color: theme.textSecondary }]}>{item.email}</Text>
        <View style={[
          styles.roleBadge, 
          { backgroundColor: item.role === 'admin' ? theme.primary + '20' : theme.border }
        ]}>
          <Text style={[
            styles.roleText, 
            { color: item.role === 'admin' ? theme.primary : theme.textSecondary }
          ]}>{item.role.toUpperCase()}</Text>
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => handleToggleRole(item._id)} style={styles.actionBtn}>
          <Ionicons name="swap-horizontal" size={20} color={theme.primary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeleteUser(item._id)} style={styles.actionBtn}>
          <Ionicons name="trash-outline" size={20} color={theme.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {loading ? (
        <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item._id}
          renderItem={renderUserItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={() => <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No users found</Text>}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
          initialNumToRender={15}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={true}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16 },
  card: { borderRadius: 12, padding: 16, marginBottom: 8, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  avatar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  avatarText: { fontWeight: '700' },
  info: { flex: 1 },
  userName: { fontSize: 16, fontWeight: '700' },
  userEmail: { fontSize: 12 },
  roleBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, marginTop: 4 },
  roleText: { fontSize: 10, fontWeight: '800' },
  actions: { flexDirection: 'row' },
  actionBtn: { padding: 8, marginLeft: 4 },
  emptyText: { textAlign: 'center', marginTop: 40 },
});

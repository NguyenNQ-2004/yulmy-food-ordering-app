import React, { useContext, useMemo, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import AdminBottomBar from '../../components/admin/AdminBottomBar';
import AdminHeader from '../../components/admin/AdminHeader';
import { AdminContext } from '../../context/AdminContext';
import { AuthContext } from '../../context/AuthContext';

const RED = '#b11226';
const RED_SOFT = '#fbe8eb';
const BACKGROUND = '#f7f5f2';
const CARD = '#ffffff';
const TEXT = '#151515';
const MUTED = '#7b7b86';

const FILTERS = ['all', 'customer', 'restaurant_owner', 'admin', 'blocked'];

const ROLE_LABELS = {
  customer: 'Customer',
  restaurant_owner: 'Owner',
  admin: 'Admin',
};

export default function AdminUsersScreen({ navigation }) {
  const { currentUser, logout } = useContext(AuthContext);
  const { users, toggleUserStatus, error, loading } = useContext(AdminContext);
  const [keyword, setKeyword] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const avatarLabel = currentUser?.fullName
    ? currentUser.fullName
        .split(' ')
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase()
    : 'AD';

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const searchText = keyword.trim().toLowerCase();
      const matchesSearch = !searchText
        ? true
        : [user.fullName, user.email, user.role, user.status]
            .join(' ')
            .toLowerCase()
            .includes(searchText);

      const matchesFilter =
        activeFilter === 'all'
          ? true
          : activeFilter === 'blocked'
            ? user.status === 'blocked'
            : user.role === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [activeFilter, keyword, users]);

  const handleLogout = () => {
    Alert.alert('Logout', 'Do you want to logout from admin portal?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  const handleToggleStatus = (user) => {
    const nextAction = user.status === 'active' ? 'Block' : 'Unblock';
    const nextStatus = user.status === 'active' ? 'blocked' : 'active';

    Alert.alert(
      `${nextAction} User`,
      `${nextAction} ${user.fullName} (${ROLE_LABELS[user.role] || user.role})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: nextAction,
          style: user.status === 'active' ? 'destructive' : 'default',
          onPress: async () => {
            try {
              await toggleUserStatus(user.id, nextStatus);
            } catch (requestError) {
              Alert.alert(
                'Update Failed',
                requestError.response?.data?.message ||
                  'Could not update this user.'
              );
            }
          },
        },
      ]
    );
  };

  const showUserDetails = (user) => {
    Alert.alert(
      user.fullName,
      `Role: ${ROLE_LABELS[user.role] || user.role}\nStatus: ${user.status}\nEmail: ${user.email}\nPhone: ${user.phone}\nJoined: ${user.joinedAt}`
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.root}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <AdminHeader
            avatarLabel={avatarLabel}
            onAvatarPress={handleLogout}
            onBackPress={() => navigation.navigate('AdminDashboard')}
          />

          <Text style={styles.screenTitle}>User Management</Text>
          <Text style={styles.screenSubtitle}>
            Search accounts, review roles, and control access across the app.
          </Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.searchBox}>
            <Text style={styles.searchPrefix}>Q</Text>
            <TextInput
              value={keyword}
              onChangeText={setKeyword}
              placeholder="Search users by name, email or role..."
              placeholderTextColor="#9a9aa5"
              style={styles.searchInput}
            />
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            {FILTERS.map((filter) => {
              const isActive = activeFilter === filter;
              const label =
                filter === 'all'
                  ? 'All Users'
                  : filter === 'restaurant_owner'
                    ? 'Owners'
                    : filter === 'blocked'
                      ? 'Blocked'
                      : filter.charAt(0).toUpperCase() + filter.slice(1);

              return (
                <TouchableOpacity
                  key={filter}
                  style={[styles.filterPill, isActive && styles.filterPillActive]}
                  activeOpacity={0.85}
                  onPress={() => setActiveFilter(filter)}
                >
                  <Text
                    style={[styles.filterText, isActive && styles.filterTextActive]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {loading.users && users.length === 0 ? (
            <Text style={styles.helperText}>Loading users...</Text>
          ) : null}

          {filteredUsers.map((user) => (
            <View key={user.id} style={styles.userCard}>
              <View style={styles.userTopRow}>
                <View style={styles.userLeft}>
                  <View style={styles.avatarShell}>
                    <View style={styles.avatarFill}>
                      <Text style={styles.avatarText}>{user.avatar}</Text>
                    </View>
                  </View>

                  <View style={styles.userInfo}>
                    <View style={styles.nameRow}>
                      <Text style={styles.userName}>{user.fullName}</Text>
                      <View
                        style={[
                          styles.rolePill,
                          user.role === 'admin'
                            ? styles.roleAdmin
                            : user.role === 'restaurant_owner'
                              ? styles.roleOwner
                              : styles.roleCustomer,
                        ]}
                      >
                        <Text style={styles.roleText}>
                          {ROLE_LABELS[user.role] || user.role}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.userEmail}>{user.email}</Text>
                  </View>
                </View>

                <View style={styles.userStatusWrap}>
                  <Text style={styles.statusLabel}>Status</Text>
                  <Text
                    style={[
                      styles.statusValue,
                      user.status === 'active'
                        ? styles.statusActive
                        : styles.statusBlocked,
                    ]}
                  >
                    {user.status === 'active' ? 'Active' : 'Blocked'}
                  </Text>
                </View>
              </View>

              <View style={styles.userActions}>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    user.status === 'active'
                      ? styles.actionDanger
                      : styles.actionNeutral,
                  ]}
                  activeOpacity={0.85}
                  onPress={() => handleToggleStatus(user)}
                >
                  <Text
                    style={[
                      styles.actionButtonText,
                      user.status === 'active'
                        ? styles.actionDangerText
                        : styles.actionNeutralText,
                    ]}
                  >
                    {user.status === 'active' ? 'Block' : 'Unblock'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.actionPrimary]}
                  activeOpacity={0.85}
                  onPress={() => showUserDetails(user)}
                >
                  <Text style={[styles.actionButtonText, styles.actionPrimaryText]}>
                    Details
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {filteredUsers.length === 0 && !loading.users ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No users found</Text>
              <Text style={styles.emptyText}>
                Change the keyword or filter to show other accounts.
              </Text>
            </View>
          ) : null}
        </ScrollView>

        <AdminBottomBar activeTab="users" navigation={navigation} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  root: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 132,
  },
  screenTitle: {
    color: TEXT,
    fontSize: 29,
    fontWeight: '800',
    marginBottom: 6,
  },
  screenSubtitle: {
    color: MUTED,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  errorText: {
    color: RED,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 12,
  },
  helperText: {
    color: MUTED,
    fontSize: 13,
    marginBottom: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ecd8d5',
    paddingHorizontal: 14,
    minHeight: 54,
    marginBottom: 14,
  },
  searchPrefix: {
    color: RED,
    fontSize: 13,
    fontWeight: '800',
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: TEXT,
    fontSize: 14,
  },
  filterRow: {
    paddingRight: 10,
    gap: 10,
    marginBottom: 18,
  },
  filterPill: {
    backgroundColor: CARD,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#ecd8d5',
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  filterPillActive: {
    backgroundColor: RED,
    borderColor: RED,
  },
  filterText: {
    color: MUTED,
    fontSize: 12,
    fontWeight: '700',
  },
  filterTextActive: {
    color: '#fff',
  },
  userCard: {
    backgroundColor: CARD,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#f1eee8',
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.04,
    shadowRadius: 18,
    elevation: 2,
    marginBottom: 14,
  },
  userTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  userLeft: {
    flexDirection: 'row',
    flex: 1,
    paddingRight: 10,
  },
  avatarShell: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#efe7dc',
    padding: 3,
    borderWidth: 1,
    borderColor: '#ece2d5',
    marginRight: 10,
  },
  avatarFill: {
    flex: 1,
    borderRadius: 19,
    backgroundColor: '#36404a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  userInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  userName: {
    color: TEXT,
    fontSize: 16,
    fontWeight: '800',
  },
  rolePill: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  roleAdmin: {
    backgroundColor: RED_SOFT,
  },
  roleOwner: {
    backgroundColor: '#eef0f5',
  },
  roleCustomer: {
    backgroundColor: '#f3f0ea',
  },
  roleText: {
    color: '#6d7080',
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  userEmail: {
    color: MUTED,
    fontSize: 12,
  },
  userStatusWrap: {
    alignItems: 'flex-end',
  },
  statusLabel: {
    color: '#9a9aa5',
    fontSize: 10,
    textTransform: 'uppercase',
    fontWeight: '700',
    marginBottom: 3,
  },
  statusValue: {
    fontSize: 12,
    fontWeight: '800',
  },
  statusActive: {
    color: '#2f8d5e',
  },
  statusBlocked: {
    color: RED,
  },
  userActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
  },
  actionPrimary: {
    backgroundColor: RED,
    borderColor: RED,
  },
  actionDanger: {
    backgroundColor: '#fff5f6',
    borderColor: '#efc4ca',
  },
  actionNeutral: {
    backgroundColor: '#f6f3ef',
    borderColor: '#e5ddd4',
  },
  actionButtonText: {
    fontSize: 11,
    fontWeight: '800',
  },
  actionPrimaryText: {
    color: '#fff',
  },
  actionDangerText: {
    color: RED,
  },
  actionNeutralText: {
    color: '#5f6474',
  },
  emptyCard: {
    backgroundColor: CARD,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#f1eee8',
  },
  emptyTitle: {
    color: TEXT,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  emptyText: {
    color: MUTED,
    fontSize: 13,
    lineHeight: 18,
  },
});

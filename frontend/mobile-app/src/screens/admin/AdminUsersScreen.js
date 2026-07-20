import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
  Modal,
  RefreshControl,
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

function StatChip({ label, value, active, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.statChip, active && styles.statChipActive]}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <Text style={[styles.statChipValue, active && styles.statChipValueActive]}>
        {value}
      </Text>
      <Text style={[styles.statChipLabel, active && styles.statChipLabelActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function AdminUsersScreen({ navigation, route }) {
  const { currentUser, confirmLogout } = useContext(AuthContext);
  const { users, toggleUserStatus, deleteUser, loadUsers, error, loading } =
    useContext(AdminContext);
  const [keyword, setKeyword] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [statusTarget, setStatusTarget] = useState(null);
  const [statusVisible, setStatusVisible] = useState(false);
  const [statusSubmitting, setStatusSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [noticeVisible, setNoticeVisible] = useState(false);
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeMessage, setNoticeMessage] = useState('');

  const avatarLabel = currentUser?.fullName
    ? currentUser.fullName
        .split(' ')
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase()
    : 'AD';

  const summary = useMemo(() => {
    const counts = {
      all: users.length,
      customer: 0,
      restaurant_owner: 0,
      admin: 0,
      blocked: 0,
    };

    users.forEach((user) => {
      if (counts[user.role] !== undefined) {
        counts[user.role] += 1;
      }
      if (user.status === 'blocked') {
        counts.blocked += 1;
      }
    });

    return counts;
  }, [users]);

  const filteredUsers = useMemo(() => {
    const searchText = keyword.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch = !searchText
        ? true
        : [
            user.fullName,
            user.email,
            user.role,
            user.status,
            user.phone,
            user.address,
          ]
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
    confirmLogout('Do you want to logout from admin portal?');
  };

  const openNotice = (title, message) => {
    setNoticeTitle(title);
    setNoticeMessage(message);
    setNoticeVisible(true);
  };

  useEffect(() => {
    if (route.params?.noticeAt) {
      openNotice(
        route.params.noticeTitle || 'Completed',
        route.params.noticeMessage || 'Action completed successfully.'
      );
      navigation.setParams({
        noticeAt: undefined,
        noticeTitle: undefined,
        noticeMessage: undefined,
      });
    }
  }, [
    navigation,
    route.params?.noticeAt,
    route.params?.noticeMessage,
    route.params?.noticeTitle,
  ]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  };

  const handleOpenDetails = (user) => {
    setSelectedUser(user);
    setDetailVisible(true);
  };

  const handleOpenStatus = (user) => {
    if (user.id === currentUser?.id) {
      openNotice('Unavailable', 'You cannot change your own account status.');
      return;
    }

    setStatusTarget(user);
    setStatusVisible(true);
  };

  const handleConfirmStatus = async () => {
    if (!statusTarget || statusSubmitting) {
      return;
    }

    const nextStatus = statusTarget.status === 'active' ? 'blocked' : 'active';

    try {
      setStatusSubmitting(true);
      const updatedUser = await toggleUserStatus(statusTarget.id, nextStatus);
      setStatusVisible(false);

      if (selectedUser?.id === updatedUser.id) {
        setSelectedUser(updatedUser);
      }

      openNotice(
        nextStatus === 'blocked' ? 'User Blocked' : 'User Unblocked',
        `${updatedUser.fullName} is now ${nextStatus}.`
      );
    } catch (requestError) {
      openNotice(
        'Update Failed',
        requestError.response?.data?.message || 'Could not update this user.'
      );
    } finally {
      setStatusSubmitting(false);
    }
  };

  const handleOpenDelete = (user) => {
    if (user.id === currentUser?.id) {
      openNotice('Unavailable', 'You cannot delete your own account.');
      return;
    }

    setDeleteTarget(user);
    setDeleteVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget || deleteSubmitting) {
      return;
    }

    try {
      setDeleteSubmitting(true);
      await deleteUser(deleteTarget.id);
      setDeleteVisible(false);

      if (selectedUser?.id === deleteTarget.id) {
        setDetailVisible(false);
        setSelectedUser(null);
      }

      openNotice('Deleted', `${deleteTarget.fullName} has been removed.`);
    } catch (requestError) {
      openNotice(
        'Delete Failed',
        requestError.response?.data?.message || 'Could not delete this user.'
      );
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const navigateToEdit = (user) => {
    navigation.navigate('AdminUserForm', { userId: user.id });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.root}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={RED}
            />
          }
        >
          <AdminHeader
            avatarLabel={avatarLabel}
            onAvatarPress={handleLogout}
            onBackPress={() => navigation.navigate('AdminDashboard')}
          />

          <Text style={styles.screenTitle}>User Management</Text>
          <Text style={styles.screenSubtitle}>
            Search accounts, inspect profile details, and manage user access across the app.
          </Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.searchBox}>
            <Text style={styles.searchPrefix}>Search</Text>
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
            contentContainerStyle={styles.statsRow}
          >
            {FILTERS.map((filter) => {
              const label =
                filter === 'all'
                  ? 'All'
                  : filter === 'restaurant_owner'
                    ? 'Owners'
                    : filter === 'blocked'
                      ? 'Blocked'
                      : filter.charAt(0).toUpperCase() + filter.slice(1);

              return (
                <StatChip
                  key={filter}
                  label={label}
                  value={summary[filter] || 0}
                  active={activeFilter === filter}
                  onPress={() => setActiveFilter(filter)}
                />
              );
            })}
          </ScrollView>

          {loading.users && users.length === 0 ? (
            <Text style={styles.helperText}>Loading users...</Text>
          ) : null}

          {!loading.users && filteredUsers.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No users found</Text>
              <Text style={styles.emptyText}>
                Change the keyword or filter to show other accounts.
              </Text>
            </View>
          ) : null}

          {filteredUsers.map((user) => {
            const isSelf = user.id === currentUser?.id;

            return (
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
                        {isSelf ? (
                          <View style={styles.selfPill}>
                            <Text style={styles.selfPillText}>You</Text>
                          </View>
                        ) : null}
                      </View>

                      <Text style={styles.userEmail}>{user.email}</Text>
                      {user.phone ? <Text style={styles.userMeta}>{user.phone}</Text> : null}
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

                <Text style={styles.joinedText}>Joined {user.joinedAt}</Text>

                <View style={styles.userActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.actionLight]}
                    activeOpacity={0.85}
                    onPress={() => handleOpenDetails(user)}
                  >
                    <Text style={[styles.actionButtonText, styles.actionLightText]}>
                      Details
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.actionNeutral]}
                    activeOpacity={0.85}
                    onPress={() => navigateToEdit(user)}
                  >
                    <Text style={[styles.actionButtonText, styles.actionNeutralText]}>
                      Edit
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      isSelf
                        ? styles.actionDisabled
                        : user.status === 'active'
                          ? styles.actionDanger
                          : styles.actionNeutral,
                    ]}
                    activeOpacity={0.85}
                    disabled={isSelf}
                    onPress={() => handleOpenStatus(user)}
                  >
                    <Text
                      style={[
                        styles.actionButtonText,
                        isSelf
                          ? styles.actionDisabledText
                          : user.status === 'active'
                            ? styles.actionDangerText
                            : styles.actionNeutralText,
                      ]}
                    >
                      {isSelf ? 'Current User' : user.status === 'active' ? 'Block' : 'Unblock'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      isSelf ? styles.actionDisabled : styles.actionDelete,
                    ]}
                    activeOpacity={0.85}
                    disabled={isSelf}
                    onPress={() => handleOpenDelete(user)}
                  >
                    <Text
                      style={[
                        styles.actionButtonText,
                        isSelf ? styles.actionDisabledText : styles.actionDeleteText,
                      ]}
                    >
                      Delete
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </ScrollView>

        <TouchableOpacity
          style={styles.addButton}
          activeOpacity={0.9}
          onPress={() => navigation.navigate('AdminUserForm')}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>

        <AdminBottomBar activeTab="users" navigation={navigation} />
      </View>

      <Modal
        visible={detailVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDetailVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.detailSheet}>
            <View style={styles.modalTopRow}>
              <Text style={styles.modalTitle}>User Detail</Text>
              <TouchableOpacity onPress={() => setDetailVisible(false)}>
                <Text style={styles.closeText}>Close</Text>
              </TouchableOpacity>
            </View>

            {selectedUser ? (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.detailHero}>
                  <View style={styles.detailAvatarShell}>
                    <View style={styles.detailAvatarFill}>
                      <Text style={styles.detailAvatarText}>{selectedUser.avatar}</Text>
                    </View>
                  </View>
                  <Text style={styles.detailName}>{selectedUser.fullName}</Text>
                  <Text style={styles.detailRole}>
                    {ROLE_LABELS[selectedUser.role] || selectedUser.role}
                  </Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Account</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Email</Text>
                    <Text style={styles.detailValue}>{selectedUser.email}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Phone</Text>
                    <Text style={styles.detailValue}>{selectedUser.phone || 'Not provided'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Status</Text>
                    <Text style={styles.detailValue}>
                      {selectedUser.status === 'active' ? 'Active' : 'Blocked'}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Joined</Text>
                    <Text style={styles.detailValue}>{selectedUser.joinedAt}</Text>
                  </View>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Address</Text>
                  <Text style={styles.detailParagraph}>
                    {selectedUser.address || 'No address available'}
                  </Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Preferences</Text>
                  <View style={styles.preferenceRow}>
                    <Text style={styles.preferenceLabel}>Two factor authentication</Text>
                    <Text style={styles.preferenceValue}>
                      {selectedUser.preferences.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                    </Text>
                  </View>
                  <View style={styles.preferenceRow}>
                    <Text style={styles.preferenceLabel}>Push notifications</Text>
                    <Text style={styles.preferenceValue}>
                      {selectedUser.preferences.pushNotificationsEnabled ? 'Enabled' : 'Disabled'}
                    </Text>
                  </View>
                  <View style={styles.preferenceRow}>
                    <Text style={styles.preferenceLabel}>Email reports</Text>
                    <Text style={styles.preferenceValue}>
                      {selectedUser.preferences.emailReportsEnabled ? 'Enabled' : 'Disabled'}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailActionRow}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.actionNeutral, styles.detailButton]}
                    onPress={() => navigateToEdit(selectedUser)}
                  >
                    <Text style={[styles.actionButtonText, styles.actionNeutralText]}>
                      Edit User
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      selectedUser.id === currentUser?.id
                        ? styles.actionDisabled
                        : styles.actionDelete,
                      styles.detailButton,
                    ]}
                    disabled={selectedUser.id === currentUser?.id}
                    onPress={() => handleOpenDelete(selectedUser)}
                  >
                    <Text
                      style={[
                        styles.actionButtonText,
                        selectedUser.id === currentUser?.id
                          ? styles.actionDisabledText
                          : styles.actionDeleteText,
                      ]}
                    >
                      Delete User
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            ) : null}
          </View>
        </View>
      </Modal>

      <Modal
        visible={statusVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setStatusVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.statusCard}>
            <Text style={styles.modalTitle}>
              {statusTarget?.status === 'active' ? 'Block User' : 'Unblock User'}
            </Text>
            <Text style={styles.modalMessage}>
              {statusTarget
                ? `${statusTarget.status === 'active' ? 'Block' : 'Unblock'} ${statusTarget.fullName} (${ROLE_LABELS[statusTarget.role] || statusTarget.role})?`
                : ''}
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                disabled={statusSubmitting}
                onPress={() => setStatusVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                disabled={statusSubmitting}
                onPress={handleConfirmStatus}
              >
                <Text style={styles.confirmButtonText}>
                  {statusSubmitting
                    ? 'Saving...'
                    : statusTarget?.status === 'active'
                      ? 'Block'
                      : 'Unblock'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={deleteVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.statusCard}>
            <Text style={styles.modalTitle}>Delete User</Text>
            <Text style={styles.modalMessage}>
              {deleteTarget
                ? `Delete ${deleteTarget.fullName}? This removes the account and related chat, cart, notification, and review data.`
                : ''}
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                disabled={deleteSubmitting}
                onPress={() => setDeleteVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                disabled={deleteSubmitting}
                onPress={handleConfirmDelete}
              >
                <Text style={styles.confirmButtonText}>
                  {deleteSubmitting ? 'Deleting...' : 'Delete'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={noticeVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setNoticeVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.statusCard}>
            <Text style={styles.modalTitle}>{noticeTitle}</Text>
            <Text style={styles.modalMessage}>{noticeMessage}</Text>

            <TouchableOpacity
              style={[styles.modalButton, styles.confirmButton, styles.noticeButton]}
              onPress={() => setNoticeVisible(false)}
            >
              <Text style={styles.confirmButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    marginTop: 10,
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
    fontSize: 12,
    fontWeight: '800',
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: TEXT,
    fontSize: 14,
  },
  statsRow: {
    paddingRight: 12,
    gap: 10,
    marginBottom: 18,
  },
  statChip: {
    backgroundColor: CARD,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ecd8d5',
    paddingHorizontal: 14,
    paddingVertical: 10,
    minWidth: 86,
  },
  statChipActive: {
    backgroundColor: RED,
    borderColor: RED,
  },
  statChipValue: {
    color: TEXT,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  statChipValueActive: {
    color: '#fff',
  },
  statChipLabel: {
    color: MUTED,
    fontSize: 11,
    fontWeight: '700',
  },
  statChipLabelActive: {
    color: '#ffe7ea',
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
    marginBottom: 10,
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
    marginLeft: 8,
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
  selfPill: {
    backgroundColor: '#f6f3ef',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  selfPillText: {
    color: '#8a7b70',
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  userEmail: {
    color: MUTED,
    fontSize: 12,
    marginBottom: 2,
  },
  userMeta: {
    color: '#5f6474',
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
  joinedText: {
    color: '#7a7d89',
    fontSize: 12,
    marginBottom: 12,
  },
  userActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginLeft: 8,
  },
  actionButton: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
  },
  actionLight: {
    backgroundColor: '#fffdfb',
    borderColor: '#eadcd8',
  },
  actionNeutral: {
    backgroundColor: '#f6f3ef',
    borderColor: '#e5ddd4',
  },
  actionDanger: {
    backgroundColor: '#fff5f6',
    borderColor: '#efc4ca',
  },
  actionDelete: {
    backgroundColor: '#fff1f2',
    borderColor: '#efb6bf',
  },
  actionDisabled: {
    backgroundColor: '#f2f3f5',
    borderColor: '#e4e6ea',
  },
  actionButtonText: {
    fontSize: 11,
    fontWeight: '800',
  },
  actionLightText: {
    color: TEXT,
  },
  actionNeutralText: {
    color: '#5f6474',
  },
  actionDangerText: {
    color: RED,
  },
  actionDeleteText: {
    color: RED,
  },
  actionDisabledText: {
    color: '#9a9aa5',
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
  addButton: {
    position: 'absolute',
    right: 18,
    bottom: 100,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: RED,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: RED,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 31,
    lineHeight: 31,
    marginTop: -2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(39, 24, 22, 0.4)',
    justifyContent: 'flex-end',
  },
  detailSheet: {
    backgroundColor: CARD,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 28,
    maxHeight: '86%',
  },
  modalTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    color: TEXT,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  closeText: {
    color: RED,
    fontSize: 14,
    fontWeight: '700',
  },
  detailHero: {
    alignItems: 'center',
    marginBottom: 18,
  },
  detailAvatarShell: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: '#efe7dc',
    padding: 4,
    borderWidth: 1,
    borderColor: '#ece2d5',
    marginBottom: 12,
  },
  detailAvatarFill: {
    flex: 1,
    borderRadius: 37,
    backgroundColor: '#36404a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailAvatarText: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '800',
  },
  detailName: {
    color: TEXT,
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  detailRole: {
    color: '#8a7b70',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  detailSection: {
    borderWidth: 1,
    borderColor: '#f1eee8',
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
  },
  detailSectionTitle: {
    color: TEXT,
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 10,
  },
  detailLabel: {
    color: MUTED,
    fontSize: 12,
  },
  detailValue: {
    color: TEXT,
    fontSize: 12,
    fontWeight: '700',
    flexShrink: 1,
    textAlign: 'right',
  },
  detailParagraph: {
    color: '#5f6474',
    fontSize: 13,
    lineHeight: 18,
  },
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 10,
  },
  preferenceLabel: {
    color: MUTED,
    fontSize: 12,
    flex: 1,
  },
  preferenceValue: {
    color: TEXT,
    fontSize: 12,
    fontWeight: '700',
  },
  detailActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  detailButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusCard: {
    marginHorizontal: 18,
    marginBottom: 28,
    marginTop: 'auto',
    backgroundColor: CARD,
    borderRadius: 24,
    padding: 20,
  },
  modalMessage: {
    fontSize: 14,
    color: '#5b403d',
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 22,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#f0e5e3',
    backgroundColor: '#fff',
    marginRight: 8,
  },
  confirmButton: {
    backgroundColor: '#B11226',
    marginLeft: 8,
  },
  cancelButtonText: {
    color: '#8f6f6c',
    fontSize: 15,
    fontWeight: '700',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  noticeButton: {
    marginLeft: 0,
  },
});

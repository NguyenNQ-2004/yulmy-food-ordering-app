import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import AdminBottomBar from '../../components/admin/AdminBottomBar';
import AdminHeader from '../../components/admin/AdminHeader';
import { AuthContext } from '../../context/AuthContext';

const RED = '#b11226';
const BACKGROUND = '#f7f5f2';
const CARD = '#ffffff';
const TEXT = '#151515';
const MUTED = '#7b7b86';

const INFO_CONTENT = {
  about: {
    title: 'About Yulmy Admin',
    description:
      'Yulmy Admin is the control center for system-wide operations. You can monitor statistics, manage users, restaurants, foods, orders, and moderate reviews from one place.',
  },
  help: {
    title: 'Help Center',
    description:
      'For admin support, contact the project support mailbox and include the affected module, current account, and a short repro note so the issue can be traced quickly.',
  },
  terms: {
    title: 'Terms of Service',
    description:
      'Admin accounts are intended for internal system management. Actions taken here affect live business data, so access should stay restricted to authorized team members only.',
  },
};

const getAvatarLabel = (fullName) =>
  fullName
    ? fullName
        .split(' ')
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase()
    : 'AD';

const getRoleLabel = (role) => {
  if (!role) {
    return 'Admin';
  }

  return role.replace(/_/g, ' ').toUpperCase();
};

export default function AdminSettingsScreen({ navigation }) {
  const {
    currentUser,
    confirmLogout,
    refreshCurrentUser,
    updatePreferences,
    changePassword,
  } = useContext(AuthContext);
  const [preferences, setPreferences] = useState({
    twoFactorEnabled: false,
    pushNotificationsEnabled: true,
    emailReportsEnabled: true,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [savingPreference, setSavingPreference] = useState('');
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [infoKey, setInfoKey] = useState('');

  useEffect(() => {
    setPreferences({
      twoFactorEnabled: Boolean(currentUser?.preferences?.twoFactorEnabled),
      pushNotificationsEnabled:
        currentUser?.preferences?.pushNotificationsEnabled !== undefined
          ? Boolean(currentUser.preferences.pushNotificationsEnabled)
          : true,
      emailReportsEnabled:
        currentUser?.preferences?.emailReportsEnabled !== undefined
          ? Boolean(currentUser.preferences.emailReportsEnabled)
          : true,
    });
  }, [currentUser]);

  const accountRows = useMemo(
    () => [
      {
        id: 'email',
        label: 'Email',
        value: currentUser?.email || 'No email',
      },
      {
        id: 'phone',
        label: 'Phone',
        value: currentUser?.phone || 'Not updated',
      },
      {
        id: 'status',
        label: 'Status',
        value: currentUser?.status === 'blocked' ? 'Blocked' : 'Active',
      },
    ],
    [currentUser]
  );

  const fullName = currentUser?.fullName || 'Admin Name';
  const avatarLabel = getAvatarLabel(currentUser?.fullName);
  const roleLabel = getRoleLabel(currentUser?.role);
  const infoContent = infoKey ? INFO_CONTENT[infoKey] : null;

  const handleLogout = () => {
    confirmLogout('Do you want to logout from admin portal?');
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    const result = await refreshCurrentUser();
    setRefreshing(false);

    if (!result.success) {
      Alert.alert('Refresh failed', result.message);
    }
  };

  const handleTogglePreference = async (key) => {
    const nextValue = !preferences[key];
    const previousPreferences = preferences;

    setPreferences((current) => ({
      ...current,
      [key]: nextValue,
    }));
    setSavingPreference(key);

    const result = await updatePreferences({
      [key]: nextValue,
    });

    setSavingPreference('');

    if (!result.success) {
      setPreferences(previousPreferences);
      Alert.alert('Update failed', result.message);
    }
  };

  const handleChangePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Missing information', 'Please fill in all password fields.');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Invalid password', 'New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Password mismatch', 'New password and confirmation do not match.');
      return;
    }

    setPasswordSubmitting(true);
    const result = await changePassword(currentPassword, newPassword);
    setPasswordSubmitting(false);

    if (!result.success) {
      Alert.alert('Change failed', result.message);
      return;
    }

    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setPasswordModalVisible(false);
    Alert.alert('Success', result.message);
  };

  const handleOpenInfo = (key) => {
    setInfoKey(key);
  };

  const handleHelpMail = async () => {
    const supportEmail = 'support@yulmy.app';
    const mailtoUrl = `mailto:${supportEmail}?subject=Admin%20Support%20Request`;

    try {
      const supported = await Linking.canOpenURL(mailtoUrl);
      if (!supported) {
        Alert.alert('Unavailable', `Email client is not available. Contact: ${supportEmail}`);
        return;
      }

      await Linking.openURL(mailtoUrl);
    } catch (error) {
      Alert.alert('Unavailable', `Email client is not available. Contact: ${supportEmail}`);
    }
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

          <View style={styles.profileWrap}>
            <View style={styles.profileOuter}>
              <View style={styles.profileInner}>
                <Text style={styles.profileAvatarText}>{avatarLabel}</Text>
              </View>
              <View style={styles.profileBadge}>
                <Text style={styles.profileBadgeText}>A</Text>
              </View>
            </View>

            <Text style={styles.profileName}>{fullName}</Text>
            <Text style={styles.profileRole}>{roleLabel}</Text>
          </View>

          <View style={styles.sectionBlock}>
            <Text style={styles.sectionTitle}>Account Snapshot</Text>
            <View style={styles.sectionCard}>
              {accountRows.map((item, index) => (
                <View
                  key={item.id}
                  style={[
                    styles.settingRow,
                    index < accountRows.length - 1 && styles.settingRowBorder,
                  ]}
                >
                  <Text style={styles.settingLabel}>{item.label}</Text>
                  <Text style={styles.valueText}>{item.value}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.sectionBlock}>
            <Text style={styles.sectionTitle}>Security</Text>
            <View style={styles.sectionCard}>
              <TouchableOpacity
                style={[styles.settingRow, styles.settingRowBorder]}
                activeOpacity={0.85}
                onPress={() => setPasswordModalVisible(true)}
              >
                <View style={styles.settingLeft}>
                  <View style={styles.settingIconBox}>
                    <Text style={styles.settingIconText}>PW</Text>
                  </View>
                  <Text style={styles.settingLabel}>Change Password</Text>
                </View>
                <Text style={styles.chevron}>{'>'}</Text>
              </TouchableOpacity>

              <View style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <View style={styles.settingIconBox}>
                    <Text style={styles.settingIconText}>2F</Text>
                  </View>
                  <View style={styles.settingCopy}>
                    <Text style={styles.settingLabel}>Two Factor Auth</Text>
                    <Text style={styles.settingHint}>Require extra verification on login</Text>
                  </View>
                </View>
                <View style={styles.switchWrap}>
                  {savingPreference === 'twoFactorEnabled' ? (
                    <ActivityIndicator size="small" color={RED} />
                  ) : (
                    <Switch
                      value={preferences.twoFactorEnabled}
                      onValueChange={() => handleTogglePreference('twoFactorEnabled')}
                      trackColor={{ false: '#ded9d2', true: '#e8a0aa' }}
                      thumbColor={preferences.twoFactorEnabled ? RED : '#ffffff'}
                    />
                  )}
                </View>
              </View>
            </View>
          </View>

          <View style={styles.sectionBlock}>
            <Text style={styles.sectionTitle}>Notifications</Text>
            <View style={styles.sectionCard}>
              <View style={[styles.settingRow, styles.settingRowBorder]}>
                <View style={styles.settingLeft}>
                  <View style={styles.settingIconBox}>
                    <Text style={styles.settingIconText}>PS</Text>
                  </View>
                  <View style={styles.settingCopy}>
                    <Text style={styles.settingLabel}>Push Settings</Text>
                    <Text style={styles.settingHint}>In-app admin push alerts</Text>
                  </View>
                </View>
                <View style={styles.switchWrap}>
                  {savingPreference === 'pushNotificationsEnabled' ? (
                    <ActivityIndicator size="small" color={RED} />
                  ) : (
                    <Switch
                      value={preferences.pushNotificationsEnabled}
                      onValueChange={() =>
                        handleTogglePreference('pushNotificationsEnabled')
                      }
                      trackColor={{ false: '#ded9d2', true: '#e8a0aa' }}
                      thumbColor={preferences.pushNotificationsEnabled ? RED : '#ffffff'}
                    />
                  )}
                </View>
              </View>

              <View style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <View style={styles.settingIconBox}>
                    <Text style={styles.settingIconText}>ER</Text>
                  </View>
                  <View style={styles.settingCopy}>
                    <Text style={styles.settingLabel}>Email Reports</Text>
                    <Text style={styles.settingHint}>Receive admin summary reports</Text>
                  </View>
                </View>
                <View style={styles.switchWrap}>
                  {savingPreference === 'emailReportsEnabled' ? (
                    <ActivityIndicator size="small" color={RED} />
                  ) : (
                    <Switch
                      value={preferences.emailReportsEnabled}
                      onValueChange={() =>
                        handleTogglePreference('emailReportsEnabled')
                      }
                      trackColor={{ false: '#ded9d2', true: '#e8a0aa' }}
                      thumbColor={preferences.emailReportsEnabled ? RED : '#ffffff'}
                    />
                  )}
                </View>
              </View>
            </View>
          </View>

          <View style={styles.sectionBlock}>
            <Text style={styles.sectionTitle}>App</Text>
            <View style={styles.sectionCard}>
              <TouchableOpacity
                style={[styles.settingRow, styles.settingRowBorder]}
                activeOpacity={0.85}
                onPress={() => handleOpenInfo('about')}
              >
                <View style={styles.settingLeft}>
                  <View style={styles.settingIconBox}>
                    <Text style={styles.settingIconText}>AB</Text>
                  </View>
                  <Text style={styles.settingLabel}>About Us</Text>
                </View>
                <Text style={styles.chevron}>{'>'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.settingRow, styles.settingRowBorder]}
                activeOpacity={0.85}
                onPress={() => handleOpenInfo('help')}
              >
                <View style={styles.settingLeft}>
                  <View style={styles.settingIconBox}>
                    <Text style={styles.settingIconText}>HC</Text>
                  </View>
                  <Text style={styles.settingLabel}>Help Center</Text>
                </View>
                <Text style={styles.chevron}>{'>'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.settingRow}
                activeOpacity={0.85}
                onPress={() => handleOpenInfo('terms')}
              >
                <View style={styles.settingLeft}>
                  <View style={styles.settingIconBox}>
                    <Text style={styles.settingIconText}>TS</Text>
                  </View>
                  <Text style={styles.settingLabel}>Terms of Service</Text>
                </View>
                <Text style={styles.chevron}>{'>'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.logoutButton}
            activeOpacity={0.9}
            onPress={handleLogout}
          >
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>

          <Text style={styles.versionText}>Version 4.2.0 | Build 1024</Text>
        </ScrollView>

        <AdminBottomBar activeTab="settings" navigation={navigation} />

        <Modal
          animationType="slide"
          visible={passwordModalVisible}
          transparent
          onRequestClose={() => setPasswordModalVisible(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Change Password</Text>
              <Text style={styles.modalDescription}>
                Update the admin account password for the current session.
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Current password"
                placeholderTextColor="#9a9aa3"
                secureTextEntry
                value={passwordForm.currentPassword}
                onChangeText={(value) =>
                  setPasswordForm((current) => ({
                    ...current,
                    currentPassword: value,
                  }))
                }
              />
              <TextInput
                style={styles.input}
                placeholder="New password"
                placeholderTextColor="#9a9aa3"
                secureTextEntry
                value={passwordForm.newPassword}
                onChangeText={(value) =>
                  setPasswordForm((current) => ({
                    ...current,
                    newPassword: value,
                  }))
                }
              />
              <TextInput
                style={styles.input}
                placeholder="Confirm new password"
                placeholderTextColor="#9a9aa3"
                secureTextEntry
                value={passwordForm.confirmPassword}
                onChangeText={(value) =>
                  setPasswordForm((current) => ({
                    ...current,
                    confirmPassword: value,
                  }))
                }
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  activeOpacity={0.85}
                  onPress={() => {
                    setPasswordModalVisible(false);
                    setPasswordForm({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: '',
                    });
                  }}
                >
                  <Text style={styles.secondaryButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.primaryButton}
                  activeOpacity={0.9}
                  onPress={handleChangePassword}
                  disabled={passwordSubmitting}
                >
                  <Text style={styles.primaryButtonText}>
                    {passwordSubmitting ? 'Saving...' : 'Update'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Modal
          animationType="fade"
          visible={Boolean(infoContent)}
          transparent
          onRequestClose={() => setInfoKey('')}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.infoCard}>
              <Text style={styles.modalTitle}>{infoContent?.title}</Text>
              <Text style={styles.modalDescription}>{infoContent?.description}</Text>

              {infoKey === 'help' ? (
                <TouchableOpacity
                  style={styles.helpButton}
                  activeOpacity={0.9}
                  onPress={handleHelpMail}
                >
                  <Text style={styles.helpButtonText}>Email Support</Text>
                </TouchableOpacity>
              ) : null}

              <TouchableOpacity
                style={styles.secondaryFullButton}
                activeOpacity={0.85}
                onPress={() => setInfoKey('')}
              >
                <Text style={styles.secondaryButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
  profileWrap: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  profileOuter: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#efe7dc',
    padding: 4,
    borderWidth: 1,
    borderColor: '#ece2d5',
    marginBottom: 10,
  },
  profileInner: {
    flex: 1,
    borderRadius: 38,
    backgroundColor: '#36404a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
  },
  profileBadge: {
    position: 'absolute',
    right: 3,
    bottom: 3,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: RED,
    borderWidth: 2,
    borderColor: BACKGROUND,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
  profileName: {
    color: TEXT,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  profileRole: {
    color: MUTED,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  sectionBlock: {
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#8f8f99',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  sectionCard: {
    backgroundColor: CARD,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#f1eee8',
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.04,
    shadowRadius: 18,
    elevation: 2,
  },
  settingRow: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f3eee8',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 12,
  },
  settingCopy: {
    flex: 1,
  },
  settingIconBox: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#fff5f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingIconText: {
    color: RED,
    fontSize: 10,
    fontWeight: '800',
  },
  settingLabel: {
    color: TEXT,
    fontSize: 14,
    fontWeight: '600',
  },
  settingHint: {
    color: MUTED,
    fontSize: 11,
    marginTop: 3,
  },
  valueText: {
    color: MUTED,
    fontSize: 13,
    fontWeight: '600',
    maxWidth: '62%',
    textAlign: 'right',
  },
  switchWrap: {
    minWidth: 52,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  chevron: {
    color: '#a2a4ad',
    fontSize: 16,
    fontWeight: '700',
  },
  logoutButton: {
    backgroundColor: RED,
    borderRadius: 14,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: RED,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 5,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
  versionText: {
    color: '#b0b0b8',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 12,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 15, 15, 0.42)',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  modalCard: {
    backgroundColor: CARD,
    borderRadius: 22,
    padding: 20,
  },
  infoCard: {
    backgroundColor: CARD,
    borderRadius: 22,
    padding: 20,
  },
  modalTitle: {
    color: TEXT,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  modalDescription: {
    color: MUTED,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 16,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#eadfd5',
    borderRadius: 14,
    paddingHorizontal: 14,
    color: TEXT,
    marginBottom: 10,
    backgroundColor: '#fcfbf9',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  secondaryButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#eadfd5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  secondaryFullButton: {
    minHeight: 46,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#eadfd5',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  secondaryButtonText: {
    color: TEXT,
    fontSize: 14,
    fontWeight: '700',
  },
  primaryButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 14,
    backgroundColor: RED,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  helpButton: {
    minHeight: 46,
    borderRadius: 14,
    backgroundColor: RED,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  helpButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
});

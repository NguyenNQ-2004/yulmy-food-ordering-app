import React, { useContext, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  Platform,
  Dimensions,
} from 'react-native';

import { AuthContext } from '../../context/AuthContext';

const { width } = Dimensions.get('window');
const RED = '#B11226';
const LIGHT_BG = '#fffaf9';
const GRAY = '#888';

const SettingsIcon = ({ type }) => {
  switch (type) {
    case 'password':
      return (
        <View style={styles.iconWrapper}>
          <Text style={styles.iconUnicode}>🔒</Text>
        </View>
      );
    case 'security':
      return (
        <View style={styles.iconWrapper}>
          <Text style={styles.iconUnicode}>🛡️</Text>
        </View>
      );
    case 'notifications':
      return (
        <View style={styles.iconWrapper}>
          <Text style={styles.iconUnicode}>🔔</Text>
        </View>
      );
    case 'reports':
      return (
        <View style={styles.iconWrapper}>
          <Text style={styles.iconUnicode}>📊</Text>
        </View>
      );
    default:
      return null;
  }
};

export default function SettingsScreen({ navigation }) {
  const { currentUser, updatePreferences, changePassword } = useContext(AuthContext);

  const [preferences, setPreferences] = useState({
    twoFactorEnabled: false,
    pushNotificationsEnabled: true,
    emailReportsEnabled: true,
  });

  const [refreshing, setRefreshing] = useState(false);
  const [savingPreference, setSavingPreference] = useState('');
  
  // Password state
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);

  // Security (Two-Factor) Modal state
  const [twoFactorModalVisible, setTwoFactorModalVisible] = useState(false);

  // Email Reports Modal state
  const [emailModalVisible, setEmailModalVisible] = useState(false);

  // Sync preferences from current user
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

  const handleTogglePreference = async (key, nextValue) => {
    const previousPreferences = preferences;

    setPreferences((current) => ({
      ...current,
      [key]: nextValue,
    }));
    setSavingPreference(key);

    const payload = {};
    payload[key] = nextValue;

    const result = await updatePreferences(payload);
    setSavingPreference('');

    if (!result.success) {
      setPreferences(previousPreferences);
      Alert.alert('Update failed', result.message);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      Alert.alert('Validation Error', 'Please fill in all password fields.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      Alert.alert('Validation Error', 'New passwords do not match.');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      Alert.alert('Validation Error', 'Password must be at least 6 characters.');
      return;
    }

    setPasswordSubmitting(true);
    const result = await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
    setPasswordSubmitting(false);

    if (result.success) {
      Alert.alert('Success', result.message || 'Password updated successfully!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setPasswordModalVisible(false);
    } else {
      Alert.alert('Error', result.message || 'Failed to change password.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>{'<-'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings Portal</Text>
        
        {/* Small header user avatar on the right */}
        <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.navigate('Profile')}>
          <Image 
            source={{ uri: currentUser?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' }} 
            style={styles.headerAvatar} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Main Centered Profile Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <Image 
              source={{ uri: currentUser?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' }} 
              style={styles.largeAvatar} 
            />
            {/* Checked badge on bottom-right of avatar */}
            <View style={styles.checkedBadge}>
              <Text style={styles.checkedMark}>✓</Text>
            </View>
          </View>
          <Text style={styles.profileName}>{currentUser?.fullName || 'Nguyen Customer'}</Text>
          <Text style={styles.profileRole}>{(currentUser?.role || 'CUSTOMER').toUpperCase()}</Text>
        </View>

        {/* ACCOUNT SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>ACCOUNT</Text>
          <View style={styles.card}>
            {/* Change Password Row */}
            <TouchableOpacity 
              style={styles.row} 
              onPress={() => setPasswordModalVisible(true)}
              activeOpacity={0.7}
            >
              <View style={styles.rowLeft}>
                <SettingsIcon type="password" />
                <Text style={styles.rowLabel}>Change Password</Text>
              </View>
              <Text style={styles.chevron}>&gt;</Text>
            </TouchableOpacity>
            
            <View style={styles.divider} />

            {/* Two-Factor Auth Row */}
            <TouchableOpacity 
              style={styles.row} 
              onPress={() => setTwoFactorModalVisible(true)}
              activeOpacity={0.7}
            >
              <View style={styles.rowLeft}>
                <SettingsIcon type="security" />
                <Text style={styles.rowLabel}>Two-Factor Auth</Text>
              </View>
              <View style={styles.rowRight}>
                {savingPreference === 'twoFactorEnabled' ? (
                  <ActivityIndicator size="small" color={RED} />
                ) : (
                  <Text style={[styles.statusText, preferences.twoFactorEnabled ? styles.statusEnabled : styles.statusDisabled]}>
                    {preferences.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                  </Text>
                )}
                <Text style={styles.chevron}>&gt;</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* NOTIFICATIONS SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>NOTIFICATIONS</Text>
          <View style={styles.card}>
            {/* Push Settings Row */}
            <TouchableOpacity 
              style={styles.row} 
              onPress={() => handleTogglePreference('pushNotificationsEnabled', !preferences.pushNotificationsEnabled)}
              activeOpacity={0.7}
            >
              <View style={styles.rowLeft}>
                <SettingsIcon type="notifications" />
                <Text style={styles.rowLabel}>Push Settings</Text>
              </View>
              <View style={styles.rowRight}>
                {savingPreference === 'pushNotificationsEnabled' ? (
                  <ActivityIndicator size="small" color={RED} />
                ) : (
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusBadgeText}>
                      {preferences.pushNotificationsEnabled ? 'Enabled' : 'Disabled'}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
            
            <View style={styles.divider} />

            {/* Email Reports Row */}
            <TouchableOpacity 
              style={styles.row} 
              onPress={() => setEmailModalVisible(true)}
              activeOpacity={0.7}
            >
              <View style={styles.rowLeft}>
                <SettingsIcon type="reports" />
                <Text style={styles.rowLabel}>Email Reports</Text>
              </View>
              <View style={styles.rowRight}>
                {savingPreference === 'emailReportsEnabled' ? (
                  <ActivityIndicator size="small" color={RED} />
                ) : (
                  <Text style={[styles.statusText, preferences.emailReportsEnabled ? styles.statusEnabled : styles.statusDisabled]}>
                    {preferences.emailReportsEnabled ? 'Enabled' : 'Disabled'}
                  </Text>
                )}
                <Text style={styles.chevron}>&gt;</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* CHANGE PASSWORD MODAL */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={passwordModalVisible}
        onRequestClose={() => setPasswordModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContentCard}>
            <Text style={styles.modalTitle}>Change Password</Text>
            <Text style={styles.modalSubtitle}>Please enter your current and new password details.</Text>

            <TextInput
              style={styles.inputField}
              placeholder="Current Password"
              placeholderTextColor="#a08582"
              secureTextEntry
              value={passwordForm.currentPassword}
              onChangeText={(text) => setPasswordForm(prev => ({ ...prev, currentPassword: text }))}
            />

            <TextInput
              style={styles.inputField}
              placeholder="New Password"
              placeholderTextColor="#a08582"
              secureTextEntry
              value={passwordForm.newPassword}
              onChangeText={(text) => setPasswordForm(prev => ({ ...prev, newPassword: text }))}
            />

            <TextInput
              style={styles.inputField}
              placeholder="Confirm New Password"
              placeholderTextColor="#a08582"
              secureTextEntry
              value={passwordForm.confirmPassword}
              onChangeText={(text) => setPasswordForm(prev => ({ ...prev, confirmPassword: text }))}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelBtn]} 
                onPress={() => {
                  setPasswordModalVisible(false);
                  setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                }}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmBtn]} 
                onPress={handleChangePassword}
                disabled={passwordSubmitting}
              >
                <Text style={styles.confirmBtnText}>
                  {passwordSubmitting ? 'Updating...' : 'Update'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* TWO FACTOR AUTH MODAL */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={twoFactorModalVisible}
        onRequestClose={() => setTwoFactorModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContentCard}>
            <Text style={styles.modalTitle}>Two-Factor Authentication</Text>
            <Text style={styles.modalSubtitle}>Enhance your account security by requiring an extra verification code on logins.</Text>
            
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Enable Two-Factor Auth</Text>
              <Switch
                value={preferences.twoFactorEnabled}
                onValueChange={(val) => handleTogglePreference('twoFactorEnabled', val)}
                trackColor={{ false: '#ded9d2', true: RED + '40' }}
                thumbColor={preferences.twoFactorEnabled ? RED : '#ffffff'}
              />
            </View>

            <TouchableOpacity 
              style={[styles.modalCloseButton]} 
              onPress={() => setTwoFactorModalVisible(false)}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* EMAIL REPORTS MODAL */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={emailModalVisible}
        onRequestClose={() => setEmailModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContentCard}>
            <Text style={styles.modalTitle}>Email Reports</Text>
            <Text style={styles.modalSubtitle}>Receive weekly billing summaries, ordering reports, and culinary preferences via email.</Text>
            
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Receive Weekly Reports</Text>
              <Switch
                value={preferences.emailReportsEnabled}
                onValueChange={(val) => handleTogglePreference('emailReportsEnabled', val)}
                trackColor={{ false: '#ded9d2', true: RED + '40' }}
                thumbColor={preferences.emailReportsEnabled ? RED : '#ffffff'}
              />
            </View>

            <TouchableOpacity 
              style={[styles.modalCloseButton]} 
              onPress={() => setEmailModalVisible(false)}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Search')}>
          <Text style={styles.navIcon}>🔍</Text>
          <Text style={styles.navLabel}>Search</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Favorites')}>
          <Text style={styles.navIcon}>♥</Text>
          <Text style={styles.navLabel}>Favorites</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('OrderHistory')}>
          <Text style={styles.navIcon}>📋</Text>
          <Text style={styles.navLabel}>Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={[styles.navIcon, styles.navActiveIcon]}>👤</Text>
          <Text style={styles.navActiveText}>Profile</Text>
          <View style={styles.activeDot} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LIGHT_BG,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: LIGHT_BG,
  },
  headerIcon: {
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 20,
    color: RED,
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#fde8eb',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: RED,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 15,
    paddingBottom: 80,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 35,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  largeAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#eee',
    borderWidth: 2,
    borderColor: '#fff',
  },
  checkedBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: RED,
    borderWidth: 2,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedMark: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: -1,
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
  },
  profileRole: {
    fontSize: 12,
    fontWeight: 'bold',
    color: GRAY,
    marginTop: 6,
    letterSpacing: 0.5,
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: GRAY,
    letterSpacing: 0.8,
    marginBottom: 12,
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#fde8eb',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#FFF0F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  iconUnicode: {
    fontSize: 18,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
  },
  chevron: {
    fontSize: 15,
    color: '#b09491',
    fontWeight: 'bold',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  statusEnabled: {
    color: RED,
  },
  statusDisabled: {
    color: '#999',
  },
  statusBadge: {
    backgroundColor: '#FFF0F2',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
  },
  statusBadgeText: {
    color: RED,
    fontSize: 12,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#fde8eb',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(39, 24, 22, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContentCard: {
    width: '85%',
    maxWidth: 380,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: GRAY,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  inputField: {
    width: '100%',
    height: 48,
    backgroundColor: '#fffaf9',
    borderWidth: 1,
    borderColor: '#fde8eb',
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#333',
    marginBottom: 12,
  },
  modalActions: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
    marginTop: 15,
  },
  modalButton: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#fde8eb',
  },
  confirmBtn: {
    backgroundColor: RED,
  },
  cancelBtnText: {
    color: '#8f6f6c',
    fontWeight: 'bold',
    fontSize: 15,
  },
  confirmBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#fffaf9',
    borderWidth: 1,
    borderColor: '#fde8eb',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  modalCloseButton: {
    width: '100%',
    height: 46,
    borderRadius: 23,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#fde8eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: '#8f6f6c',
    fontWeight: 'bold',
    fontSize: 15,
  },
  bottomNav: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0e5e3',
    paddingBottom: Platform.OS === 'ios' ? 0 : 6,
    paddingTop: 6,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  navIcon: {
    fontSize: 20,
    color: '#a08582',
  },
  navActiveIcon: {
    color: RED,
  },
  navLabel: {
    color: '#a08582',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  navActiveText: {
    color: RED,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: RED,
    position: 'absolute',
    bottom: 2,
  },
});

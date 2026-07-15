import React, { useContext, useMemo, useState } from 'react';
import {
  Alert,
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
import { AdminContext } from '../../context/AdminContext';
import { AuthContext } from '../../context/AuthContext';

const RED = '#b11226';
const BACKGROUND = '#f7f5f2';
const CARD = '#ffffff';
const TEXT = '#151515';
const MUTED = '#7b7b86';

const ROLE_OPTIONS = ['customer', 'restaurant_owner', 'admin'];
const STATUS_OPTIONS = ['active', 'blocked'];
const ROLE_LABELS = {
  customer: 'Customer',
  restaurant_owner: 'Owner',
  admin: 'Admin',
};

export default function AdminUserFormScreen({ navigation, route }) {
  const { currentUser, confirmLogout, refreshCurrentUser } = useContext(AuthContext);
  const { users, createUser, updateUser } = useContext(AdminContext);

  const existingUser = useMemo(
    () => users.find((user) => user.id === route.params?.userId),
    [route.params?.userId, users]
  );

  const isEditing = Boolean(existingUser);
  const isSelf = existingUser?.id === currentUser?.id;

  const [fullName, setFullName] = useState(existingUser?.fullName || '');
  const [email, setEmail] = useState(existingUser?.email || '');
  const [phone, setPhone] = useState(existingUser?.phone || '');
  const [address, setAddress] = useState(existingUser?.address || '');
  const [avatarUrl, setAvatarUrl] = useState(existingUser?.avatarUrl || '');
  const [role, setRole] = useState(existingUser?.role || 'customer');
  const [status, setStatus] = useState(existingUser?.status || 'active');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [preferences, setPreferences] = useState({
    twoFactorEnabled: Boolean(existingUser?.preferences?.twoFactorEnabled),
    pushNotificationsEnabled:
      existingUser?.preferences?.pushNotificationsEnabled !== undefined
        ? Boolean(existingUser.preferences.pushNotificationsEnabled)
        : true,
    emailReportsEnabled:
      existingUser?.preferences?.emailReportsEnabled !== undefined
        ? Boolean(existingUser.preferences.emailReportsEnabled)
        : true,
  });
  const [saving, setSaving] = useState(false);

  const avatarLabel = currentUser?.fullName
    ? currentUser.fullName
        .split(' ')
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase()
    : 'AD';

  const screenTitle = isEditing ? 'Edit User' : 'Add User';

  const handleLogout = () => {
    confirmLogout('Do you want to logout from admin portal?');
  };

  const handleSave = async () => {
    if (saving) {
      return;
    }

    if (!fullName.trim()) {
      Alert.alert('Missing name', 'Please enter full name.');
      return;
    }

    if (!email.trim()) {
      Alert.alert('Missing email', 'Please enter email address.');
      return;
    }

    if (!isEditing && !password.trim()) {
      Alert.alert('Missing password', 'Please enter a password for this user.');
      return;
    }

    if (password && password.length < 6) {
      Alert.alert('Invalid password', 'Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password mismatch', 'Password confirmation does not match.');
      return;
    }

    const payload = {
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      address: address.trim(),
      avatar: avatarUrl.trim(),
      role,
      status,
      preferences,
    };

    if (password.trim()) {
      payload.password = password.trim();
    }

    try {
      setSaving(true);

      if (isEditing) {
        await updateUser(existingUser.id, payload);

        if (isSelf) {
          await refreshCurrentUser();
        }

        navigation.navigate('AdminUsers', {
          noticeTitle: 'Saved',
          noticeMessage: 'User updated successfully.',
          noticeAt: Date.now(),
        });
        return;
      }

      await createUser(payload);
      navigation.navigate('AdminUsers', {
        noticeTitle: 'Created',
        noticeMessage: 'New user has been added.',
        noticeAt: Date.now(),
      });
    } catch (requestError) {
      Alert.alert(
        'Save Failed',
        requestError.response?.data?.message || 'Could not save this user.'
      );
    } finally {
      setSaving(false);
    }
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
            onBackPress={() => navigation.goBack()}
          />

          <Text style={styles.screenTitle}>{screenTitle}</Text>
          <Text style={styles.screenSubtitle}>
            Manage account profile, access role, security preferences, and status.
          </Text>

          {isSelf ? (
            <View style={styles.helperCard}>
              <Text style={styles.helperTitle}>Current admin account</Text>
              <Text style={styles.helperText}>
                Your own role and account status stay locked here to avoid removing admin access.
              </Text>
            </View>
          ) : null}

          <View style={styles.card}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter full name"
              placeholderTextColor="#9a9aa5"
              style={styles.input}
            />

            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Enter email"
              placeholderTextColor="#9a9aa5"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />

            <View style={styles.inlineFields}>
              <View style={styles.inlineField}>
                <Text style={styles.inputLabel}>Phone</Text>
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Phone number"
                  placeholderTextColor="#9a9aa5"
                  style={styles.input}
                />
              </View>

              <View style={styles.inlineField}>
                <Text style={styles.inputLabel}>Avatar URL</Text>
                <TextInput
                  value={avatarUrl}
                  onChangeText={setAvatarUrl}
                  placeholder="Image URL"
                  placeholderTextColor="#9a9aa5"
                  autoCapitalize="none"
                  style={styles.input}
                />
              </View>
            </View>

            <Text style={styles.inputLabel}>Address</Text>
            <TextInput
              value={address}
              onChangeText={setAddress}
              placeholder="Enter address"
              placeholderTextColor="#9a9aa5"
              style={[styles.input, styles.textArea]}
              multiline
              textAlignVertical="top"
            />

            <Text style={styles.inputLabel}>Role</Text>
            <View style={styles.optionGroup}>
              {ROLE_OPTIONS.map((option) => {
                const isSelected = role === option;
                return (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.optionPill,
                      isSelected && styles.optionPillActive,
                      isSelf && styles.optionPillDisabled,
                    ]}
                    activeOpacity={0.85}
                    disabled={isSelf}
                    onPress={() => setRole(option)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        isSelected && styles.optionTextActive,
                        isSelf && styles.optionTextDisabled,
                      ]}
                    >
                      {ROLE_LABELS[option] || option}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.inputLabel}>Status</Text>
            <View style={styles.optionGroup}>
              {STATUS_OPTIONS.map((option) => {
                const isSelected = status === option;
                return (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.optionPill,
                      isSelected && styles.optionPillActive,
                      isSelf && styles.optionPillDisabled,
                    ]}
                    activeOpacity={0.85}
                    disabled={isSelf}
                    onPress={() => setStatus(option)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        isSelected && styles.optionTextActive,
                        isSelf && styles.optionTextDisabled,
                      ]}
                    >
                      {option === 'active' ? 'Active' : 'Blocked'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.inputLabel}>
              {isEditing ? 'New Password (Optional)' : 'Password'}
            </Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder={isEditing ? 'Leave blank to keep current password' : 'Enter password'}
              placeholderTextColor="#9a9aa5"
              secureTextEntry
              style={styles.input}
            />

            <Text style={styles.inputLabel}>Confirm Password</Text>
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Re-enter password"
              placeholderTextColor="#9a9aa5"
              secureTextEntry
              style={styles.input}
            />

            <View style={styles.preferenceCard}>
              <View style={styles.preferenceRow}>
                <View style={styles.preferenceCopy}>
                  <Text style={styles.preferenceTitle}>Two Factor Authentication</Text>
                  <Text style={styles.preferenceText}>Require extra verification on login</Text>
                </View>
                <Switch
                  value={preferences.twoFactorEnabled}
                  onValueChange={(value) =>
                    setPreferences((current) => ({
                      ...current,
                      twoFactorEnabled: value,
                    }))
                  }
                  trackColor={{ false: '#e3dde0', true: '#d98b95' }}
                  thumbColor={preferences.twoFactorEnabled ? RED : '#ffffff'}
                />
              </View>

              <View style={styles.preferenceRow}>
                <View style={styles.preferenceCopy}>
                  <Text style={styles.preferenceTitle}>Push Notifications</Text>
                  <Text style={styles.preferenceText}>Allow in-app push notifications</Text>
                </View>
                <Switch
                  value={preferences.pushNotificationsEnabled}
                  onValueChange={(value) =>
                    setPreferences((current) => ({
                      ...current,
                      pushNotificationsEnabled: value,
                    }))
                  }
                  trackColor={{ false: '#e3dde0', true: '#d98b95' }}
                  thumbColor={preferences.pushNotificationsEnabled ? RED : '#ffffff'}
                />
              </View>

              <View style={[styles.preferenceRow, styles.preferenceRowLast]}>
                <View style={styles.preferenceCopy}>
                  <Text style={styles.preferenceTitle}>Email Reports</Text>
                  <Text style={styles.preferenceText}>Receive system summary emails</Text>
                </View>
                <Switch
                  value={preferences.emailReportsEnabled}
                  onValueChange={(value) =>
                    setPreferences((current) => ({
                      ...current,
                      emailReportsEnabled: value,
                    }))
                  }
                  trackColor={{ false: '#e3dde0', true: '#d98b95' }}
                  thumbColor={preferences.emailReportsEnabled ? RED : '#ffffff'}
                />
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            activeOpacity={0.9}
            disabled={saving}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>
              {saving ? 'Saving...' : isEditing ? 'Update User' : 'Create User'}
            </Text>
          </TouchableOpacity>
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
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 6,
  },
  screenSubtitle: {
    color: MUTED,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 18,
  },
  helperCard: {
    backgroundColor: '#fff3e8',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f2d0b4',
    padding: 14,
    marginBottom: 16,
  },
  helperTitle: {
    color: '#8d4c0d',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  helperText: {
    color: '#9a6a3a',
    fontSize: 12,
    lineHeight: 18,
  },
  card: {
    backgroundColor: CARD,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f1eee8',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.04,
    shadowRadius: 18,
    elevation: 2,
  },
  inputLabel: {
    color: '#7f6e63',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fffdfb',
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#ecd8d5',
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: TEXT,
    fontSize: 14,
    marginBottom: 14,
  },
  inlineFields: {
    flexDirection: 'row',
    gap: 12,
  },
  inlineField: {
    flex: 1,
  },
  textArea: {
    minHeight: 96,
  },
  optionGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  optionPill: {
    backgroundColor: '#fffdfb',
    borderWidth: 1,
    borderColor: '#ecd8d5',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  optionPillActive: {
    backgroundColor: RED,
    borderColor: RED,
  },
  optionPillDisabled: {
    opacity: 0.6,
  },
  optionText: {
    color: MUTED,
    fontSize: 12,
    fontWeight: '700',
  },
  optionTextActive: {
    color: '#fff',
  },
  optionTextDisabled: {
    color: '#8f8f99',
  },
  preferenceCard: {
    backgroundColor: '#f6f3ef',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eadfd8',
  },
  preferenceRowLast: {
    borderBottomWidth: 0,
  },
  preferenceCopy: {
    flex: 1,
    paddingRight: 12,
  },
  preferenceTitle: {
    color: TEXT,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  preferenceText: {
    color: MUTED,
    fontSize: 12,
    lineHeight: 18,
  },
  saveButton: {
    backgroundColor: RED,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 18,
    shadowColor: RED,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 5,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const RED = '#b11226';

export default function AdminHeader({
  title = 'Admin Portal',
  avatarLabel = 'AD',
  onAvatarPress,
  onBackPress,
}) {
  return (
    <View style={styles.headerRow}>
      <View style={styles.titleWrap}>
        <TouchableOpacity style={styles.backRow} activeOpacity={0.85} onPress={onBackPress}>
          <Text style={styles.backIcon}>{'<'}</Text>
          <Text style={styles.portalTitle}>{title}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.avatarButton}
        activeOpacity={0.85}
        onPress={onAvatarPress}
      >
        <View style={styles.avatarOuter}>
          <View style={styles.avatarInner}>
            <Text style={styles.avatarText}>{avatarLabel}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  titleWrap: {
    flex: 1,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  backIcon: {
    color: RED,
    fontSize: 20,
    lineHeight: 20,
    marginRight: 8,
    marginTop: -1,
    fontWeight: '700',
  },
  portalTitle: {
    color: RED,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  avatarButton: {
    marginLeft: 16,
  },
  avatarOuter: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#efe7dc',
    padding: 3,
    borderWidth: 1,
    borderColor: '#ece2d5',
  },
  avatarInner: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: '#36404a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

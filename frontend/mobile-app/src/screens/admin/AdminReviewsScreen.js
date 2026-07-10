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
const BACKGROUND = '#f7f5f2';
const CARD = '#ffffff';
const TEXT = '#151515';
const MUTED = '#7b7b86';

const FILTERS = ['pending', 'approved', 'hidden', 'all'];

export default function AdminReviewsScreen({ navigation }) {
  const { currentUser, confirmLogout } = useContext(AuthContext);
  const { reviews, reviewStats, updateReviewStatus, error, loading } =
    useContext(AdminContext);
  const [keyword, setKeyword] = useState('');
  const [activeFilter, setActiveFilter] = useState('pending');

  const avatarLabel = currentUser?.fullName
    ? currentUser.fullName
        .split(' ')
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase()
    : 'AD';

  const filteredReviews = useMemo(() => {
    return reviews.filter((review) => {
      const matchesFilter =
        activeFilter === 'all' ? true : review.status === activeFilter;

      const searchText = keyword.trim().toLowerCase();
      const matchesSearch = !searchText
        ? true
        : [
            review.customerName,
            review.customerEmail,
            review.foodName,
            review.restaurantName,
            review.comment,
            review.status,
          ]
            .join(' ')
            .toLowerCase()
            .includes(searchText);

      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, keyword, reviews]);

  const handleLogout = () => {
    confirmLogout('Do you want to logout from admin portal?');
  };

  const handleReviewAction = (review, nextStatus) => {
    const label =
      nextStatus === 'approved'
        ? 'Approve'
        : nextStatus === 'hidden'
          ? 'Hide'
          : 'Move to Pending';

    Alert.alert(label, `${label} this review?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: label,
        onPress: async () => {
          try {
            await updateReviewStatus(review.id, nextStatus);
          } catch (requestError) {
            Alert.alert(
              'Update Failed',
              requestError.response?.data?.message ||
                'Could not update this review.'
            );
          }
        },
      },
    ]);
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

          <Text style={styles.screenTitle}>Review Moderation</Text>
          <Text style={styles.screenSubtitle}>
            Review feedback quality, ratings, and moderation actions.
          </Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Total Reviews</Text>
              <Text style={styles.statValue}>{reviewStats.totalReviews}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Avg Rating</Text>
              <Text style={styles.statValue}>{reviewStats.averageRating}</Text>
            </View>
          </View>

          <View style={styles.searchBox}>
            <Text style={styles.searchPrefix}>Q</Text>
            <TextInput
              value={keyword}
              onChangeText={setKeyword}
              placeholder="Search reviews..."
              placeholderTextColor="#9a9aa5"
              style={styles.searchInput}
            />
          </View>

          <View style={styles.filterRow}>
            {FILTERS.map((filter) => {
              const isActive = activeFilter === filter;
              const label = filter.charAt(0).toUpperCase() + filter.slice(1);
              return (
                <TouchableOpacity
                  key={filter}
                  style={[styles.filterPill, isActive && styles.filterPillActive]}
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
          </View>

          {loading.reviews && reviews.length === 0 ? (
            <Text style={styles.helperText}>Loading reviews...</Text>
          ) : null}

          {filteredReviews.map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View style={styles.reviewHeaderLeft}>
                  <Text style={styles.reviewTitle}>{review.foodName}</Text>
                  <Text style={styles.reviewSub}>
                    {review.customerName} • {review.createdAtLabel}
                  </Text>
                  <Text style={styles.reviewSub}>{review.restaurantName}</Text>
                </View>
                <Text style={styles.reviewRating}>
                  {'*'.repeat(Math.max(1, Math.round(review.rating)))}
                </Text>
              </View>

              <Text style={styles.reviewComment}>{review.comment}</Text>

              <View style={styles.reviewFooter}>
                <View style={styles.statusPill}>
                  <Text style={styles.statusText}>{review.status}</Text>
                </View>

                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.actionPrimary]}
                    onPress={() => handleReviewAction(review, 'approved')}
                  >
                    <Text style={styles.actionPrimaryText}>Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.actionMuted]}
                    onPress={() => handleReviewAction(review, 'hidden')}
                  >
                    <Text style={styles.actionMutedText}>Hide</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>

        <AdminBottomBar activeTab="dashboard" navigation={navigation} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BACKGROUND },
  root: { flex: 1, backgroundColor: BACKGROUND },
  scrollContent: { paddingHorizontal: 18, paddingTop: 12, paddingBottom: 132 },
  screenTitle: { color: TEXT, fontSize: 29, fontWeight: '800', marginBottom: 6 },
  screenSubtitle: { color: MUTED, fontSize: 13, lineHeight: 18, marginBottom: 16 },
  errorText: { color: RED, fontSize: 12, fontWeight: '700', marginBottom: 12 },
  helperText: { color: MUTED, fontSize: 13, marginBottom: 12 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  statCard: {
    flex: 1,
    backgroundColor: CARD,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#f1eee8',
  },
  statLabel: { color: MUTED, fontSize: 11, fontWeight: '700', marginBottom: 6 },
  statValue: { color: TEXT, fontSize: 24, fontWeight: '800' },
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
  searchPrefix: { color: RED, fontSize: 13, fontWeight: '800', marginRight: 10 },
  searchInput: { flex: 1, color: TEXT, fontSize: 14 },
  filterRow: { flexDirection: 'row', gap: 10, marginBottom: 18 },
  filterPill: {
    backgroundColor: CARD,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#ecd8d5',
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  filterPillActive: { backgroundColor: RED, borderColor: RED },
  filterText: { color: MUTED, fontSize: 12, fontWeight: '700' },
  filterTextActive: { color: '#fff' },
  reviewCard: {
    backgroundColor: CARD,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#f1eee8',
    padding: 14,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.04,
    shadowRadius: 18,
    elevation: 2,
  },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  reviewHeaderLeft: { flex: 1, paddingRight: 12 },
  reviewTitle: { color: TEXT, fontSize: 16, fontWeight: '800', marginBottom: 4 },
  reviewSub: { color: MUTED, fontSize: 12, marginBottom: 2 },
  reviewRating: { color: '#f2a52b', fontSize: 13, fontWeight: '800' },
  reviewComment: {
    color: '#484c59',
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 12,
  },
  reviewFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusPill: { backgroundColor: '#fff5f6', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  statusText: { color: RED, fontSize: 10, fontWeight: '800' },
  actionsRow: { flexDirection: 'row', gap: 8 },
  actionButton: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1 },
  actionPrimary: { backgroundColor: RED, borderColor: RED },
  actionPrimaryText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  actionMuted: { backgroundColor: '#f6f3ef', borderColor: '#e5ddd4' },
  actionMutedText: { color: '#5f6474', fontSize: 11, fontWeight: '800' },
});

import React, { useContext, useMemo, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
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
const TEXT = '#121212';
const MUTED = '#7b7b86';

function MiniLineChart({ data }) {
  const [width, setWidth] = useState(0);
  const chartHeight = 150;
  const padX = 14;
  const padTop = 18;
  const padBottom = 28;

  const points = useMemo(() => {
    if (!width || !data.length) {
      return [];
    }

    const amounts = data.map((item) => item.amount);
    const max = Math.max(...amounts);
    const min = Math.min(...amounts);
    const innerHeight = chartHeight - padTop - padBottom;
    const usableWidth = width - padX * 2;

    return data.map((item, index) => {
      const ratio = max === min ? 0.5 : (item.amount - min) / (max - min);
      const x = padX + (usableWidth / (data.length - 1)) * index;
      const y = padTop + innerHeight - ratio * innerHeight;

      return { x, y, day: item.day };
    });
  }, [data, width]);

  return (
    <View style={styles.chartOuter}>
      <View style={styles.chartHeaderRow}>
        <Text style={styles.chartTitle}>Revenue Overview</Text>
        <Text style={styles.chartRange}>Last 7 Days</Text>
      </View>

      <View
        style={styles.chartCanvas}
        onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      >
        <View style={styles.chartGlow} />

        {points.map((point, index) => {
          if (index === points.length - 1) {
            return null;
          }

          const nextPoint = points[index + 1];
          const dx = nextPoint.x - point.x;
          const dy = nextPoint.y - point.y;
          const length = Math.sqrt(dx * dx + dy * dy);
          const angle = `${Math.atan2(dy, dx)}rad`;
          const midX = (point.x + nextPoint.x) / 2;
          const midY = (point.y + nextPoint.y) / 2;

          return (
            <View
              key={`segment-${point.day}`}
              style={[
                styles.lineSegment,
                {
                  left: midX - length / 2,
                  top: midY - 1,
                  width: length,
                  transform: [{ rotate: angle }],
                },
              ]}
            />
          );
        })}

        {points.map((point, index) => (
          <View
            key={point.day}
            style={[
              styles.chartPoint,
              index === points.length - 1 && styles.chartPointActive,
              { left: point.x - 3, top: point.y - 3 },
            ]}
          />
        ))}
      </View>

      <View style={styles.dayRow}>
        {data.map((item) => (
          <Text key={item.day} style={styles.dayLabel}>
            {item.day}
          </Text>
        ))}
      </View>
    </View>
  );
}

export default function AdminDashboardScreen({ navigation }) {
  const { currentUser, logout } = useContext(AuthContext);
  const { dashboard, loading, error } = useContext(AdminContext);

  const firstName = currentUser?.fullName?.split(' ')[0] || 'Admin';
  const avatarLabel = currentUser?.fullName
    ? currentUser.fullName
        .split(' ')
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase()
    : 'AD';

  const handleLogout = () => {
    Alert.alert('Logout', 'Do you want to logout from admin portal?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  const metrics = dashboard?.metrics || {
    totalOrders: 0,
    totalUsers: 0,
    totalRestaurants: 0,
    totalFoods: 0,
    pendingOrders: 0,
    totalRevenueLabel: '$0',
  };

  const stats = [
    { key: 'orders', label: 'Total Orders', value: String(metrics.totalOrders || 0) },
    { key: 'revenue', label: 'Revenue', value: metrics.totalRevenueLabel || '$0' },
    { key: 'users', label: 'Users', value: String(metrics.totalUsers || 0) },
    {
      key: 'restaurants',
      label: 'Restaurants',
      value: String(metrics.totalRestaurants || 0),
    },
      { key: 'foods', label: 'Foods', value: String(metrics.totalFoods || 0) },
    {
      key: 'pending',
      label: 'Pending Orders',
      value: String(metrics.pendingOrders || 0),
      urgent: true,
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.root}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <AdminHeader avatarLabel={avatarLabel} onAvatarPress={handleLogout} />

          <Text style={styles.dateText}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
            })}
          </Text>
          <Text style={styles.greetingText}>Hello, {firstName}</Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.statsGrid}>
            {stats.map((item) => (
              <TouchableOpacity
                key={item.key}
                activeOpacity={0.85}
                onPress={() => {
                  if (item.key === 'users') {
                    navigation.navigate('AdminUsers');
                  } else if (item.key === 'foods') {
                    navigation.navigate('AdminFoods');
                  } else if (item.key === 'restaurants') {
                    navigation.navigate('AdminRestaurants');
                  } else if (item.key === 'pending' || item.key === 'orders') {
                    navigation.navigate('AdminOrders');
                  }
                }}
                style={[styles.statCard, item.urgent && styles.statCardUrgent]}
              >
                <Text style={styles.statLabel}>{item.label}</Text>
                <View style={styles.statValueRow}>
                  <Text style={styles.statValue}>{item.value}</Text>
                  {item.urgent ? (
                    <View style={styles.urgentBadge}>
                      <Text style={styles.urgentBadgeText}>URGENT</Text>
                    </View>
                  ) : null}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.shortcutRow}>
            <TouchableOpacity
              style={styles.shortcutButton}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('AdminRestaurants')}
            >
              <Text style={styles.shortcutLabel}>Restaurants</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.shortcutButton}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('AdminReviews')}
            >
              <Text style={styles.shortcutLabel}>Reviews</Text>
            </TouchableOpacity>
          </View>

          <MiniLineChart data={dashboard?.revenueSeries || []} />

          <View style={styles.recentHeader}>
            <Text style={styles.sectionTitle}>Recent Orders</Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate('AdminOrders')}
            >
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {loading.dashboard && !dashboard ? (
            <Text style={styles.helperText}>Loading dashboard...</Text>
          ) : null}

          {(dashboard?.recentOrders || []).map((order) => (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.orderLeft}>
                <View style={styles.orderArt}>
                  <Text style={styles.orderArtText}>{order.restaurantName.slice(0, 2).toUpperCase()}</Text>
                </View>

                <View style={styles.orderInfo}>
                  <Text style={styles.orderTitle}>Order #{order.code}</Text>
                  <Text style={styles.orderMeta}>
                    {order.restaurantName} • {order.itemCount} items
                  </Text>
                </View>
              </View>

              <View style={styles.orderRight}>
                <Text style={styles.orderAmount}>{order.totalAmountLabel}</Text>
                <Text style={styles.orderStatus}>{order.orderStatus}</Text>
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
    paddingBottom: 122,
  },
  dateText: {
    color: MUTED,
    fontSize: 14,
    marginBottom: 6,
  },
  greetingText: {
    color: TEXT,
    fontSize: 36,
    fontWeight: '800',
    marginBottom: 18,
  },
  errorText: {
    color: RED,
    marginBottom: 12,
    fontSize: 12,
    fontWeight: '700',
  },
  helperText: {
    color: MUTED,
    fontSize: 13,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 18,
  },
  shortcutRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  shortcutButton: {
    flex: 1,
    backgroundColor: CARD,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#f1eee8',
    paddingVertical: 12,
    alignItems: 'center',
  },
  shortcutLabel: {
    color: RED,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  statCard: {
    width: '48.5%',
    backgroundColor: CARD,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 15,
    minHeight: 88,
    borderWidth: 1,
    borderColor: '#f1eee8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.03,
    shadowRadius: 18,
    elevation: 2,
  },
  statCardUrgent: {
    borderLeftWidth: 2,
    borderLeftColor: RED,
  },
  statLabel: {
    color: '#666675',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.4,
    marginBottom: 10,
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  statValue: {
    color: TEXT,
    fontSize: 31,
    fontWeight: '800',
    letterSpacing: -0.7,
  },
  urgentBadge: {
    backgroundColor: RED_SOFT,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 4,
  },
  urgentBadgeText: {
    color: RED,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  chartOuter: {
    backgroundColor: CARD,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingTop: 14,
    paddingBottom: 12,
    borderWidth: 1,
    borderColor: '#f1eee8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.03,
    shadowRadius: 18,
    elevation: 2,
    marginBottom: 20,
  },
  chartHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    paddingHorizontal: 2,
  },
  chartTitle: {
    color: TEXT,
    fontSize: 16,
    fontWeight: '700',
  },
  chartRange: {
    color: RED,
    fontSize: 11,
    fontWeight: '700',
  },
  chartCanvas: {
    height: 150,
    position: 'relative',
    overflow: 'hidden',
  },
  chartGlow: {
    position: 'absolute',
    right: 10,
    top: 10,
    width: 160,
    height: 90,
    borderRadius: 80,
    backgroundColor: RED,
    opacity: 0.05,
  },
  lineSegment: {
    position: 'absolute',
    height: 2,
    backgroundColor: RED,
    borderRadius: 999,
  },
  chartPoint: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#f1b7bf',
  },
  chartPointActive: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: RED,
  },
  dayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    marginTop: 2,
  },
  dayLabel: {
    color: '#7d7f87',
    fontSize: 10,
    fontWeight: '600',
  },
  recentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    color: TEXT,
    fontSize: 19,
    fontWeight: '700',
  },
  seeAllText: {
    color: MUTED,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  orderCard: {
    backgroundColor: CARD,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#f1eee8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.03,
    shadowRadius: 18,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  orderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 12,
  },
  orderArt: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    backgroundColor: '#36404a',
  },
  orderArtText: {
    color: '#fff6ec',
    fontSize: 12,
    fontWeight: '700',
  },
  orderInfo: {
    flex: 1,
  },
  orderTitle: {
    color: TEXT,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 3,
  },
  orderMeta: {
    color: MUTED,
    fontSize: 12,
    fontWeight: '500',
  },
  orderRight: {
    alignItems: 'flex-end',
  },
  orderAmount: {
    color: TEXT,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  orderStatus: {
    color: RED,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});

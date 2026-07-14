import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  Platform,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');
const RED = '#B11226';
const LIGHT_BG = '#fffaf9';
const GRAY = '#888';

export default function TrackingScreen({ route, navigation }) {
  const { orderId } = route.params || {};

  // Mock map picture of London/city map
  const mapImageUri = 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=600&q=80';
  const driverAvatarUri = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80'; // Alex M. profile image

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>{'<-'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Epicurean</Text>
        <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.navigate('Cart')}>
          <Text style={styles.headerEmoji}>👜</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Map Section */}
        <View style={styles.mapContainer}>
          <Image source={{ uri: mapImageUri }} style={styles.mapImage} />
          
          {/* Arriving Time Badge Overlay */}
          <View style={styles.timeBadge}>
            <View style={styles.timeBadgeClockCircle}>
              <Text style={styles.timeBadgeClock}>🕒</Text>
            </View>
            <View style={styles.timeBadgeTextContainer}>
              <Text style={styles.timeBadgeLabel}>ARRIVING IN</Text>
              <Text style={styles.timeBadgeValue}>15-20 min</Text>
            </View>
          </View>
        </View>

        {/* Driver Card */}
        <View style={styles.driverCard}>
          <Image source={{ uri: driverAvatarUri }} style={styles.driverAvatar} />
          <View style={styles.driverInfo}>
            <Text style={styles.driverName}>Alex M.</Text>
            <View style={styles.driverMeta}>
              <Text style={styles.bicycleIcon}>🚲</Text>
              <Text style={styles.driverMetaText}>Bicycle • 4.9 ★</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.contactButton} onPress={() => alert('Opening chat with Alex...')}>
            <Text style={styles.contactIcon}>💬</Text>
            <Text style={styles.contactText}>Contact</Text>
          </TouchableOpacity>
        </View>

        {/* Status Timeline */}
        <View style={styles.timeline}>
          {/* Step 1: Order Placed */}
          <View style={styles.timelineStep}>
            <View style={styles.indicatorContainer}>
              <View style={styles.checkedCircle}>
                <Text style={styles.checkedMark}>✓</Text>
              </View>
              <View style={styles.verticalLine} />
            </View>
            <View style={styles.stepInfo}>
              <Text style={styles.stepTitle}>Order Placed</Text>
              <Text style={styles.stepDesc}>We've received your order at 12:45 PM.</Text>
            </View>
          </View>

          {/* Step 2: Preparing */}
          <View style={styles.timelineStep}>
            <View style={styles.indicatorContainer}>
              <View style={styles.checkedCircle}>
                <Text style={styles.checkedMark}>✓</Text>
              </View>
              <View style={styles.verticalLine} />
            </View>
            <View style={styles.stepInfo}>
              <Text style={styles.stepTitle}>Preparing</Text>
              <Text style={styles.stepDesc}>The kitchen is crafting your meal.</Text>
            </View>
          </View>

          {/* Step 3: On the Way */}
          <View style={styles.timelineStep}>
            <View style={styles.indicatorContainer}>
              <View style={styles.activeCircle}>
                <View style={styles.activeDot} />
              </View>
              <View style={[styles.verticalLine, styles.inactiveLine]} />
            </View>
            <View style={styles.stepInfo}>
              <Text style={[styles.stepTitle, styles.activeStepTitle]}>On the Way</Text>
              <Text style={[styles.stepDesc, styles.activeStepDesc]}>Alex is heading to your location.</Text>
            </View>
          </View>

          {/* Step 4: Delivered */}
          <View style={[styles.timelineStep, { minHeight: 0 }]}>
            <View style={styles.indicatorContainer}>
              <View style={styles.inactiveCircle} />
            </View>
            <View style={styles.stepInfo}>
              <Text style={[styles.stepTitle, styles.inactiveStepTitle]}>Delivered</Text>
              <Text style={styles.stepDesc}>Estimated arrival 1:05 PM.</Text>
            </View>
          </View>
        </View>
      </ScrollView>

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
        <TouchableOpacity style={styles.navItem}>
          <Text style={[styles.navIcon, styles.navActiveIcon]}>📋</Text>
          <Text style={styles.navActiveText}>Orders</Text>
          <View style={styles.activeDotIndicator} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profile')}>
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navLabel}>Profile</Text>
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
  },
  backIcon: {
    fontSize: 20,
    color: RED,
  },
  headerEmoji: {
    fontSize: 20,
    color: RED,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: RED,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  mapContainer: {
    width: '100%',
    height: 350,
    position: 'relative',
    backgroundColor: '#eee',
  },
  mapImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  timeBadge: {
    position: 'absolute',
    top: 20,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  timeBadgeClockCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: RED,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  timeBadgeClock: {
    fontSize: 16,
    color: '#fff',
    marginTop: -1.5,
  },
  timeBadgeTextContainer: {
    justifyContent: 'center',
  },
  timeBadgeLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: GRAY,
    letterSpacing: 0.5,
  },
  timeBadgeValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },
  driverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 24,
    borderRadius: 20,
    padding: 16,
    marginTop: -40,
    borderWidth: 1,
    borderColor: '#fde8eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    zIndex: 10,
  },
  driverAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },
  driverMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  bicycleIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  driverMetaText: {
    fontSize: 12,
    color: GRAY,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F2',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  contactIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  contactText: {
    color: RED,
    fontWeight: 'bold',
    fontSize: 13,
  },
  timeline: {
    paddingHorizontal: 32,
    marginTop: 30,
  },
  timelineStep: {
    flexDirection: 'row',
    minHeight: 75,
  },
  indicatorContainer: {
    alignItems: 'center',
    marginRight: 16,
    width: 24,
  },
  checkedCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: RED,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedMark: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: -1,
  },
  activeCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: RED,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: RED,
  },
  inactiveCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  verticalLine: {
    width: 2,
    flex: 1,
    backgroundColor: RED,
    marginVertical: 4,
  },
  inactiveLine: {
    backgroundColor: '#ddd',
  },
  stepInfo: {
    flex: 1,
    paddingTop: 1,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#999',
  },
  activeStepTitle: {
    color: '#222',
  },
  inactiveStepTitle: {
    color: '#aaa',
  },
  stepDesc: {
    fontSize: 13,
    color: GRAY,
    marginTop: 4,
  },
  activeStepDesc: {
    color: RED,
    fontWeight: '500',
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
  activeDotIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: RED,
    position: 'absolute',
    bottom: 2,
  },
});

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Platform,
} from 'react-native';

const RED = '#B11226';
const LIGHT_RED = '#f0d9db';

const SLIDES = [
  {
    title: 'Discover restaurants and dishes',
    subtitle: 'Explore a curated selection of culinary experiences, from hidden gems to renowned establishments, tailored to your palate.',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop&q=80',
  },
  {
    title: 'Easy ordering and secure payment',
    subtitle: 'Experience seamless checkout with encrypted transactions for your peace of mind.',
    image: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=600&auto=format&fit=crop&q=80',
  },
  {
    title: 'Smart AI food recommendations',
    subtitle: 'Let our intelligent assistant curate the perfect dining experience tailored to your unique tastes and cravings.',
    image: 'https://images.unsplash.com/photo-1531747118685-ca8fa6e08806?w=600&auto=format&fit=crop&q=80',
  }
];

export default function WelcomeScreen({ navigation }) {
  const [activeStep, setActiveStep] = useState(0);

  const handleNext = () => {
    if (activeStep < SLIDES.length - 1) {
      setActiveStep(activeStep + 1);
    } else {
      navigation.navigate('Login');
    }
  };

  const currentSlide = SLIDES[activeStep];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Row with Logo and Skip */}
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <Text style={styles.logoText}>Epicurean</Text>
        {activeStep < SLIDES.length - 1 ? (
          <TouchableOpacity 
            onPress={() => navigation.navigate('Login')}
            style={styles.skipBtn}
          >
            <Text style={styles.skipText}>SKIP</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.headerSpacer} />
        )}
      </View>

      {/* Onboarding Image */}
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: currentSlide.image }} 
          style={styles.slideImage} 
          resizeMode="cover"
        />
      </View>
      
      {/* Text & Navigation */}
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{currentSlide.title}</Text>
        <Text style={styles.subtitle}>{currentSlide.subtitle}</Text>
        
        {/* Pagination Dots (Interactive) */}
        <View style={styles.pagination}>
          {SLIDES.map((_, idx) => {
            const isSelected = activeStep === idx;
            return (
              <TouchableOpacity
                key={idx}
                style={[styles.dot, isSelected && styles.activeDot]}
                onPress={() => setActiveStep(idx)}
                activeOpacity={0.7}
              />
            );
          })}
        </View>

        {/* Action Button */}
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleNext}
        >
          <Text style={styles.buttonText}>
            {activeStep === SLIDES.length - 1 ? 'Get Started' : 'Next'} {'\u2192'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fffaf9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingBottom: 10,
  },
  headerSpacer: {
    width: 40,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '800',
    color: RED,
    textAlign: 'center',
  },
  skipBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  skipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8f6f6c',
    letterSpacing: 1,
  },
  imageContainer: {
    flex: 1.2,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  slideImage: {
    width: '100%',
    aspectRatio: 1.4,
    borderRadius: 24,
    backgroundColor: '#ffe9e6',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#271816',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 14,
    color: '#5b403d',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: LIGHT_RED,
    marginHorizontal: 5,
  },
  activeDot: {
    width: 24,
    backgroundColor: RED,
  },
  button: {
    backgroundColor: RED,
    width: '100%',
    paddingVertical: 16,
    borderRadius: 28,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: RED,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '750',
  },
});

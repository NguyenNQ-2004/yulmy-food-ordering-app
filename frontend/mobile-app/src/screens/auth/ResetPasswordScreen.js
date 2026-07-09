import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Platform,
} from 'react-native';

import { AuthContext } from '../../context/AuthContext';

const RED = '#B11226';
const LIGHT_BG = '#fffaf9';
const INPUT_BG = '#fcf2f2';

export default function ResetPasswordScreen({ navigation }) {
  const { resetPassword } = useContext(AuthContext);

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email) {
      alert('Please enter your email address');
      return;
    }

    setLoading(true);
    const result = await resetPassword(email);
    setLoading(false);

    if (result.success) {
      if (Platform.OS === 'web') {
        alert(result.message);
        navigation.navigate('Login');
      } else {
        Alert.alert('Success', result.message, [
          { text: 'OK', onPress: () => navigation.navigate('Login') }
        ]);
      }
    } else {
      alert(result.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>{'<-'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Epicurean</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.title}>Reset{'\n'}Password</Text>
        <Text style={styles.subtitle}>
          Enter the email address associated with your account and we'll send you a link to reset your password.
        </Text>

        <View style={styles.inputContainer}>
          <Text style={styles.inputIcon}>✉️</Text>
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#999"
          />
        </View>

        <TouchableOpacity 
          style={styles.resetButton} 
          onPress={handleReset}
          disabled={loading}
        >
          <Text style={styles.resetButtonText}>
            {loading ? 'Sending...' : `Send Reset Link \u2192`}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.backToSignInButton} 
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.backToSignInText}>{'<-'} Back to Sign In</Text>
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
    paddingTop: 15,
    paddingBottom: 15,
  },
  backButton: {
    padding: 10,
    marginLeft: -10,
  },
  backArrow: {
    fontSize: 18,
    color: '#333',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: RED,
  },
  contentContainer: {
    paddingHorizontal: 30,
    paddingTop: 30,
    flex: 1,
  },
  title: {
    fontSize: 38,
    fontWeight: '800',
    color: '#222',
    marginBottom: 20,
    lineHeight: 45,
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 40,
    lineHeight: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: INPUT_BG,
    borderRadius: 12,
    marginBottom: 30,
    paddingHorizontal: 15,
    height: 55,
  },
  inputIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  resetButton: {
    backgroundColor: RED,
    paddingVertical: 18,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backToSignInButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  backToSignInText: {
    color: '#555',
    fontSize: 16,
  },
});

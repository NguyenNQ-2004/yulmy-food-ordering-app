import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';

import { AuthContext } from '../../context/AuthContext';

export default function LoginScreen() {
  const { login } = useContext(AuthContext);

  const [email, setEmail] = useState('user@gmail.com');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);

    const result = await login(email, password);

    setLoading(false);

    if (!result.success) {
      Alert.alert('Login failed', result.message);
    }
  };

  const useCustomerAccount = () => {
    setEmail('user@gmail.com');
    setPassword('123456');
  };

  const useAdminAccount = () => {
    setEmail('admin@gmail.com');
    setPassword('123456');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>Yulmy</Text>
      <Text style={styles.subtitle}>Mobile Food Ordering App</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>
          {loading ? 'Logging in...' : 'Login'}
        </Text>
      </TouchableOpacity>

      <View style={styles.demoBox}>
        <Text style={styles.demoTitle}>Demo Accounts</Text>

        <TouchableOpacity style={styles.demoButton} onPress={useCustomerAccount}>
          <Text>Use Customer Account</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.demoButton} onPress={useAdminAccount}>
          <Text>Use Admin Account</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.note}>Customer: user@gmail.com / 123456</Text>
      <Text style={styles.note}>Admin: admin@gmail.com / 123456</Text>
    </View>
  );
}

const RED = '#B11226';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
    justifyContent: 'center',
  },
  logo: {
    fontSize: 42,
    fontWeight: 'bold',
    color: RED,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 36,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 14,
    borderRadius: 12,
    marginBottom: 14,
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: RED,
    padding: 15,
    borderRadius: 12,
    marginTop: 8,
  },
  loginButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  demoBox: {
    marginTop: 28,
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#f8f8f8',
  },
  demoTitle: {
    fontWeight: 'bold',
    marginBottom: 10,
  },
  demoButton: {
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 8,
  },
  note: {
    color: '#777',
    marginTop: 8,
    textAlign: 'center',
    fontSize: 12,
  },
});
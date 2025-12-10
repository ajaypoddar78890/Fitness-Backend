import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import AuthScreen from './AuthScreen';
import FirebaseAuthService from './firebase-auth-service';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authData, setAuthData] = useState(null);

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = FirebaseAuthService.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    // Clean up subscription
    return unsubscribe;
  }, []);

  const handleAuthSuccess = (result) => {
    setAuthData(result);
    setUser(result.user);
  };

  const handleSignOut = async () => {
    try {
      await FirebaseAuthService.signOut();
      setUser(null);
      setAuthData(null);
      Alert.alert('Success', 'Signed out successfully');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  // Test backend API call
  const testBackendAPI = async () => {
    try {
      const response = await FirebaseAuthService.makeAuthenticatedRequest('/auth/profile');
      Alert.alert('Backend Response', JSON.stringify(response, null, 2));
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Welcome!</Text>
      <Text style={styles.userInfo}>Email: {user.email}</Text>
      <Text style={styles.userInfo}>Display Name: {user.displayName}</Text>
      <Text style={styles.userInfo}>UID: {user.uid}</Text>
      
      {authData && (
        <View style={styles.tokenContainer}>
          <Text style={styles.tokenTitle}>Backend JWT:</Text>
          <Text style={styles.tokenText} numberOfLines={3}>
            {authData.backendJWT}
          </Text>
        </View>
      )}

      <TouchableOpacity style={styles.button} onPress={testBackendAPI}>
        <Text style={styles.buttonText}>Test Backend API</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.signOutButton]} onPress={handleSignOut}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#f5f5f5',
  },
  welcome: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  userInfo: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
    color: '#666',
  },
  tokenContainer: {
    backgroundColor: '#e9ecef',
    padding: 15,
    borderRadius: 8,
    marginVertical: 20,
  },
  tokenTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  tokenText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
  },
  signOutButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default App;
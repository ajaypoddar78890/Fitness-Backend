import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AuthService from './firebase-auth-service';

const AuthScreen = ({ onAuthSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [authMethod, setAuthMethod] = useState('traditional'); // 'traditional' or 'firebase'
  const [loading, setLoading] = useState(false);

  // Handle traditional email/password auth
  const handleTraditionalAuth = async () => {
    if (!email || !password || (!isLogin && !displayName)) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      let result;
      if (isLogin) {
        result = await AuthService.loginWithEmail(email, password);
        Alert.alert('Success', 'Logged in successfully!');
      } else {
        result = await AuthService.registerWithEmail(email, password, displayName);
        Alert.alert('Success', 'Registered successfully!');
      }
      
      onAuthSuccess({
        type: 'traditional',
        ...result,
      });
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Firebase email/password auth
  const handleFirebaseAuth = async () => {
    if (!email || !password || (!isLogin && !displayName)) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      let result;
      if (isLogin) {
        result = await AuthService.loginWithFirebase(email, password);
        Alert.alert('Success', 'Logged in with Firebase successfully!');
      } else {
        result = await AuthService.registerWithFirebase(email, password, displayName);
        Alert.alert('Success', 'Registered with Firebase successfully!');
      }
      
      onAuthSuccess({
        type: 'firebase',
        ...result,
      });
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Google Sign-In
  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await AuthService.signInWithGoogle();
      Alert.alert('Success', 'Signed in with Google!');
      onAuthSuccess({
        type: 'google',
        ...result,
      });
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {isLogin ? 'Login' : 'Register'} ({authMethod})
      </Text>

      {/* Auth Method Toggle */}
      <View style={styles.methodToggle}>
        <TouchableOpacity
          style={[
            styles.methodButton,
            authMethod === 'traditional' && styles.methodButtonActive,
          ]}
          onPress={() => setAuthMethod('traditional')}
        >
          <Text
            style={[
              styles.methodButtonText,
              authMethod === 'traditional' && styles.methodButtonTextActive,
            ]}
          >
            Traditional
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.methodButton,
            authMethod === 'firebase' && styles.methodButtonActive,
          ]}
          onPress={() => setAuthMethod('firebase')}
        >
          <Text
            style={[
              styles.methodButtonText,
              authMethod === 'firebase' && styles.methodButtonTextActive,
            ]}
          >
            Firebase
          </Text>
        </TouchableOpacity>
      </View>

      {!isLogin && (
        <TextInput
          style={styles.input}
          placeholder="Display Name"
          value={displayName}
          onChangeText={setDisplayName}
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={styles.button}
        onPress={authMethod === 'traditional' ? handleTraditionalAuth : handleFirebaseAuth}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>
            {isLogin ? 'Login' : 'Register'} with {authMethod}
          </Text>
        )}
      </TouchableOpacity>

      {authMethod === 'firebase' && (
        <TouchableOpacity
          style={[styles.button, styles.googleButton]}
          onPress={handleGoogleSignIn}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Sign in with Google</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        onPress={() => setIsLogin(!isLogin)}
        style={styles.switchButton}
      >
        <Text style={styles.switchText}>
          {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
        </Text>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  methodToggle: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#e9ecef',
    borderRadius: 8,
    padding: 4,
  },
  methodButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  methodButtonActive: {
    backgroundColor: '#007AFF',
  },
  methodButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
  },
  methodButtonTextActive: {
    color: 'white',
  },
  input: {
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
  },
  googleButton: {
    backgroundColor: '#DB4437',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchButton: {
    alignItems: 'center',
    marginTop: 20,
  },
  switchText: {
    color: '#007AFF',
    fontSize: 16,
  },
});

export default AuthScreen;
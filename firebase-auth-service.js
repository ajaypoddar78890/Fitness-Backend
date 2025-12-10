import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com', // Get this from Firebase Console
});

class AuthService {
  constructor() {
    this.auth = auth();
    
    console.log(`🔍 Platform Detection: OS = ${Platform.OS}`);
    console.log(`🔍 Platform Version: ${Platform.Version}`);
    
    // Use different URLs based on platform and device type
    if (Platform.OS === 'android') {
      // For Android emulator use 10.0.2.2, for physical device use your computer's IP
      this.baseUrl = 'http://10.0.2.2:4000';
      console.log(`🤖 Android detected - using emulator URL`);
      // Uncomment the line below if using a physical Android device
      // this.baseUrl = 'http://192.168.1.5:4000';
    } else if (Platform.OS === 'ios') {
      // For iOS simulator, localhost should work but if it doesn't, try the computer's IP
      this.baseUrl = 'http://localhost:4000';
      console.log(`🍎 iOS detected - using localhost URL`);
      // Uncomment the line below if localhost doesn't work on iOS
      // this.baseUrl = 'http://192.168.1.5:4000';
    } else {
      // For unknown platforms or if running in a web browser, try Android emulator URL first
      console.log(`❓ Unknown/Web platform (${Platform.OS}) - trying Android emulator URL`);
      this.baseUrl = 'http://10.0.2.2:4000';
    }
    
    console.log(`📡 API Base URL set to: ${this.baseUrl}`);
    console.log(`🌍 If you see "Network request failed", the app might be using the wrong URL for your device type.`);
    console.log(`💡 Android Emulator: http://10.0.2.2:4000`);
    console.log(`💡 iOS Simulator: http://localhost:4000`);
    console.log(`💡 Physical Device: http://192.168.1.5:4000`);
  }

  // ============ CONNECTIVITY TESTING ============

  // Test if the backend server is reachable
  async testConnection() {
    const urlsToTry = [
      this.baseUrl,
      'http://10.0.2.2:4000', // Android emulator
      'http://192.168.1.5:4000', // Physical device
      'http://localhost:4000', // iOS simulator/localhost
    ];

    console.log('🔍 Testing connection to backend...');
    
    for (const url of urlsToTry) {
      try {
        console.log(`📍 Trying URL: ${url}/auth/test`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout per URL
        
        const response = await fetch(`${url}/auth/test`, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          console.log(`✅ Backend connection successful with: ${url}`);
          // Update baseUrl to the working one
          this.baseUrl = url;
          console.log(`📡 Updated API Base URL to: ${this.baseUrl}`);
          return true;
        } else {
          console.log(`⚠️ ${url} responded with status: ${response.status}`);
        }
      } catch (error) {
        console.log(`❌ ${url} failed: ${error.message}`);
      }
    }
    
    console.error('❌ All backend connection attempts failed');
    console.error('💡 Make sure the backend server is running on port 4000');
    return false;
  }

  // ============ TRADITIONAL EMAIL/PASSWORD AUTH ============

  // Register with email/password
  async registerWithEmail(email, password, name) {
    try {
      console.log('🚀 Starting registration request...');
      console.log('📍 URL:', `${this.baseUrl}/auth/register`);
      console.log('📦 Payload:', { email, name, password: '***' });

      const response = await fetch(`${this.baseUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', response.headers);
      console.log('📡 Response ok:', response.ok);

      // Check if response is actually JSON
      const contentType = response.headers.get('content-type');
      console.log('📡 Content-Type:', contentType);

      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error('❌ Server returned non-JSON response:', textResponse);
        throw new Error(`Server returned ${response.status}: ${textResponse}`);
      }

      const data = await response.json();
      console.log('📥 Response data:', data);

      if (!response.ok) {
        console.error('❌ Response not OK:', data);
        throw new Error(data.message || 'Registration failed');
      }

      // Store tokens
      await this.storeTokens(data.accessToken, data.refreshToken);

      console.log('✅ Registration successful!');
      return {
        success: true,
        user: data.user,
        tokens: { accessToken: data.accessToken, refreshToken: data.refreshToken },
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // Login with email/password
  async loginWithEmail(email, password) {
    try {
      // First test if we can reach the backend
      console.log('🔗 Testing backend connectivity...');
      const isConnected = await this.testConnection();
      if (!isConnected) {
        throw new Error('Cannot connect to backend server. Please check your network connection and ensure the server is running.');
      }

      console.log('🔐 Starting login request...');
      console.log('📍 URL:', `${this.baseUrl}/auth/login`);
      console.log('📦 Payload:', { email, password: '***' });

      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', response.headers);
      console.log('📡 Response ok:', response.ok);

      // Check if response is actually JSON
      const contentType = response.headers.get('content-type');
      console.log('📡 Content-Type:', contentType);

      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error('❌ Server returned non-JSON response:', textResponse);
        throw new Error(`Server returned ${response.status}: ${textResponse}`);
      }

      const data = await response.json();
      console.log('📥 Response data:', data);

      if (!response.ok) {
        console.error('❌ Response not OK:', data);
        throw new Error(data.message || 'Login failed');
      }

      // Store tokens
      await this.storeTokens(data.accessToken, data.refreshToken);

      console.log('✅ Login successful!');
      return {
        success: true,
        user: data.user,
        tokens: { accessToken: data.accessToken, refreshToken: data.refreshToken },
      };
    } catch (error) {
      console.error('❌ Login error:', error);
      console.error('❌ Error details:', error.message);
      throw error;
    }
  }

  // ============ FIREBASE/GOOGLE AUTH ============

  // Register with Firebase (Email/Password)
  async registerWithFirebase(email, password, displayName) {
    try {
      const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
      
      // Update profile
      if (displayName) {
        await userCredential.user.updateProfile({ displayName });
      }
      
      // Get ID token and exchange with backend
      const idToken = await userCredential.user.getIdToken();
      const backendResponse = await this.firebaseLogin(idToken);
      
      return {
        success: true,
        firebaseUser: userCredential.user,
        backendUser: backendResponse.user,
        tokens: { 
          accessToken: backendResponse.accessToken, 
          refreshToken: backendResponse.refreshToken 
        },
      };
    } catch (error) {
      console.error('Firebase registration error:', error);
      throw error;
    }
  }

  // Login with Firebase (Email/Password)
  async loginWithFirebase(email, password) {
    try {
      const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
      const idToken = await userCredential.user.getIdToken();
      
      // Exchange with backend
      const backendResponse = await this.firebaseLogin(idToken);
      
      return {
        success: true,
        firebaseUser: userCredential.user,
        backendUser: backendResponse.user,
        tokens: { 
          accessToken: backendResponse.accessToken, 
          refreshToken: backendResponse.refreshToken 
        },
      };
    } catch (error) {
      console.error('Firebase login error:', error);
      throw error;
    }
  }

  // Google Sign-In
  async signInWithGoogle() {
    try {
      // Check if device supports Google Play
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      
      // Get user's ID token
      const { idToken } = await GoogleSignin.signIn();
      
      // Create Firebase credential with token
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      
      // Sign-in the user with the credential
      const userCredential = await this.auth.signInWithCredential(googleCredential);
      const firebaseIdToken = await userCredential.user.getIdToken();
      
      // Exchange with backend
      const backendResponse = await this.firebaseLogin(firebaseIdToken);
      
      return {
        success: true,
        firebaseUser: userCredential.user,
        backendUser: backendResponse.user,
        tokens: { 
          accessToken: backendResponse.accessToken, 
          refreshToken: backendResponse.refreshToken 
        },
      };
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  }

  // Exchange Firebase ID token with backend
  async firebaseLogin(idToken) {
    try {
      const response = await fetch(`${this.baseUrl}/auth/firebase-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Firebase login failed');
      }

      // Store tokens
      await this.storeTokens(data.accessToken, data.refreshToken);

      return data;
    } catch (error) {
      console.error('Firebase backend login error:', error);
      throw error;
    }
  }

  // ============ PROFILE MANAGEMENT ============

  // Get user profile
  async getProfile() {
    try {
      const accessToken = await this.getStoredAccessToken();
      if (!accessToken) throw new Error('No access token found');

      const response = await fetch(`${this.baseUrl}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get profile');
      }

      return data;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  }

  // Update profile
  async updateProfile(updates) {
    try {
      const accessToken = await this.getStoredAccessToken();
      if (!accessToken) throw new Error('No access token found');

      const response = await fetch(`${this.baseUrl}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Profile update failed');
      }

      return data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  // Change password
  async changePassword(currentPassword, newPassword) {
    try {
      const accessToken = await this.getStoredAccessToken();
      if (!accessToken) throw new Error('No access token found');

      const response = await fetch(`${this.baseUrl}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Password change failed');
      }

      return data;
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  }

  // ============ UTILITY METHODS ============

  // Sign out
  async signOut() {
    try {
      console.log('👋 Starting logout process...');
      
      // First try to logout from backend if we have a token
      try {
        const accessToken = await this.getAccessToken();
        if (accessToken) {
          console.log('📡 Calling backend logout...');
          const response = await fetch(`${this.baseUrl}/auth/logout`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`,
            },
          });
          
          if (response.ok) {
            console.log('✅ Backend logout successful');
          } else {
            console.log('⚠️ Backend logout failed (continuing with local logout)');
          }
        }
      } catch (backendError) {
        console.log('⚠️ Backend logout error (continuing with local logout):', backendError.message);
      }

      // Sign out from Firebase
      if (this.auth.currentUser) {
        console.log('🔥 Signing out from Firebase...');
        await this.auth.signOut();
      }

      // Sign out from Google
      try {
        console.log('🔍 Signing out from Google...');
        await GoogleSignin.revokeAccess();
        await GoogleSignin.signOut();
      } catch (googleError) {
        // Google sign out might fail if user wasn't signed in with Google
        console.log('Google sign out error (ignored):', googleError.message);
      }

      // Clear stored tokens
      console.log('🗑️ Clearing stored tokens...');
      await this.clearTokens();

      console.log('✅ Logout completed successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Sign out error:', error);
      throw error;
    }
  }

  // Get current Firebase user
  getCurrentFirebaseUser() {
    return this.auth.currentUser;
  }

  // Listen to Firebase auth state changes
  onAuthStateChanged(callback) {
    return this.auth.onAuthStateChanged(callback);
  }

  // Make authenticated request
  async makeAuthenticatedRequest(endpoint, options = {}) {
    try {
      const accessToken = await this.getStoredAccessToken();
      if (!accessToken) throw new Error('No access token found');

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        ...options.headers,
      };

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      return await response.json();
    } catch (error) {
      console.error('Authenticated request error:', error);
      throw error;
    }
  }

  // ============ TOKEN MANAGEMENT ============

  async storeTokens(accessToken, refreshToken) {
    try {
      await AsyncStorage.multiSet([
        ['accessToken', accessToken],
        ['refreshToken', refreshToken || ''],
      ]);
    } catch (error) {
      console.error('Token storage error:', error);
    }
  }

  async getStoredAccessToken() {
    try {
      return await AsyncStorage.getItem('accessToken');
    } catch (error) {
      console.error('Get access token error:', error);
      return null;
    }
  }

  async getStoredRefreshToken() {
    try {
      return await AsyncStorage.getItem('refreshToken');
    } catch (error) {
      console.error('Get refresh token error:', error);
      return null;
    }
  }

  async clearTokens() {
    try {
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
    } catch (error) {
      console.error('Clear tokens error:', error);
    }
  }

  async isLoggedIn() {
    const accessToken = await this.getStoredAccessToken();
    return !!accessToken;
  }
}

export default new AuthService();
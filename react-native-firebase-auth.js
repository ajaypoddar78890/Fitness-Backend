import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com', // From Firebase Console
});

class FirebaseAuthService {
  constructor() {
    this.auth = auth();
    this.firestore = firestore();
  }

  // Email/Password Registration
  async registerWithEmail(email, password, displayName) {
    try {
      const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
      
      // Update profile
      await userCredential.user.updateProfile({ displayName });
      
      // Get ID token for backend
      const idToken = await userCredential.user.getIdToken();
      
      // Register with your NestJS backend
      await this.registerWithBackend(idToken);
      
      return { user: userCredential.user, idToken };
    } catch (error) {
      throw error;
    }
  }

  // Email/Password Login
  async loginWithEmail(email, password) {
    try {
      const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
      const idToken = await userCredential.user.getIdToken();
      
      // Exchange token with backend
      const backendResponse = await this.loginWithBackend(idToken);
      
      return { 
        user: userCredential.user, 
        idToken,
        backendJWT: backendResponse.accessToken,
        userData: backendResponse.user 
      };
    } catch (error) {
      throw error;
    }
  }

  // Google Sign-In
  async signInWithGoogle() {
    try {
      // Check if device supports Google Play
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      
      // Get users ID token
      const { idToken } = await GoogleSignin.signIn();
      
      // Create Firebase credential with token
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      
      // Sign-in the user with the credential
      const userCredential = await this.auth.signInWithCredential(googleCredential);
      
      // Get Firebase ID token
      const firebaseIdToken = await userCredential.user.getIdToken();
      
      // Exchange with backend
      const backendResponse = await this.loginWithBackend(firebaseIdToken);
      
      return {
        user: userCredential.user,
        idToken: firebaseIdToken,
        backendJWT: backendResponse.accessToken,
        userData: backendResponse.user
      };
    } catch (error) {
      throw error;
    }
  }

  // Sign out
  async signOut() {
    try {
      await GoogleSignin.signOut();
      await this.auth.signOut();
    } catch (error) {
      throw error;
    }
  }

  // Get current user
  getCurrentUser() {
    return this.auth.currentUser;
  }

  // Listen to auth state changes
  onAuthStateChanged(callback) {
    return this.auth.onAuthStateChanged(callback);
  }

  // Backend Integration Methods
  async registerWithBackend(idToken) {
    try {
      const response = await fetch('http://YOUR_BACKEND_URL:4000/auth/firebase-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      });
      
      if (!response.ok) {
        throw new Error('Backend registration failed');
      }
      
      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async loginWithBackend(idToken) {
    try {
      const response = await fetch('http://YOUR_BACKEND_URL:4000/auth/firebase-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      });
      
      if (!response.ok) {
        throw new Error('Backend login failed');
      }
      
      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  // Make authenticated requests to your backend
  async makeAuthenticatedRequest(endpoint, options = {}, useFirebaseToken = true) {
    try {
      const user = this.getCurrentUser();
      if (!user) throw new Error('No authenticated user');
      
      const token = useFirebaseToken 
        ? await user.getIdToken()
        : this.getStoredJWT(); // You'd store the backend JWT in AsyncStorage
      
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      };
      
      const response = await fetch(`http://YOUR_BACKEND_URL:4000${endpoint}`, {
        ...options,
        headers,
      });
      
      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  // Firestore real-time data methods
  subscribeToUserData(userId, callback) {
    return this.firestore
      .collection('userData')
      .doc(userId)
      .onSnapshot(callback);
  }

  async updateUserData(userId, data) {
    return this.firestore
      .collection('userData')
      .doc(userId)
      .set(data, { merge: true });
  }
}

export default new FirebaseAuthService();
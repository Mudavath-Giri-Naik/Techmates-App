// app/screens/ProfileScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image, ActivityIndicator } from 'react-native';
import { User, onAuthStateChanged, signOut } from 'firebase/auth'; // Import User and onAuthStateChanged
import { FIREBASE_AUTH } from '../../firebaseConfig';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useIsFocused } from '@react-navigation/native'; // Import useIsFocused
import { TabScreenProps, RootStackNavigatorProp } from '../types'; // Use TabScreenProps for navigating to Login

// Using RootStackNavigatorProp for navigation to Login, as Login is in the RootStack
// type ProfileScreenNavigationProp = TabScreenProps<'ProfileTab'>['navigation']; // This is for navigating within tabs or to root stack

const ProfileScreen = () => {
  const navigation = useNavigation<RootStackNavigatorProp>(); // Use RootStack for Login navigation
  const [currentUser, setCurrentUser] = useState<User | null>(FIREBASE_AUTH.currentUser);
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused(); // Hook to re-check auth when screen comes into focus

  useEffect(() => {
    // Listen for auth state changes when the screen is focused or initially
    // This ensures the profile screen updates if the user logs in/out
    // from the LoginScreen and returns.
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (user) => {
      setCurrentUser(user);
      if (loading) setLoading(false); // Only set loading false on initial check
    });

    // If the screen is focused, explicitly set loading to false if it was an update
    // after initial load, otherwise the spinner might persist incorrectly.
    if (isFocused && !loading) {
        // Potentially refresh data if needed when screen comes back into focus
        // For now, just ensures currentUser state is up-to-date from onAuthStateChanged
    }


    return () => unsubscribe(); // Cleanup listener
  }, [isFocused]); // Rerun effect if isFocused changes

  const handleLogout = async () => {
    try {
      await signOut(FIREBASE_AUTH);
      // setCurrentUser(null); // onAuthStateChanged will handle this
      Alert.alert('Success', 'Signed out successfully!');
      // No navigation needed, onAuthStateChanged will update currentUser, and UI will re-render
    } catch (error: any) {
      Alert.alert('Logout Error', error.message);
    }
  };

  const navigateToLogin = () => {
    navigation.navigate('Login'); // Navigate to the Login screen in the RootStack
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!currentUser) {
    // User is NOT authenticated - Show Login/Sign Up options
    return (
      <View style={styles.centered}>
        <Icon name="person-circle-outline" size={80} color="#cccccc" />
        <Text style={styles.notLoggedInTitle}>Join Techmates!</Text>
        <Text style={styles.notLoggedInSubtitle}>
          Sign in or create an account to view your profile, post, and connect.
        </Text>
        <TouchableOpacity style={[styles.authButton, styles.loginButton]} onPress={navigateToLogin}>
          <Text style={styles.authButtonText}>Login / Sign Up</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // User IS authenticated - Show Profile
  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        <Image
          source={{ uri: currentUser.photoURL || `https://avatar.iran.liara.run/username?username=${currentUser.displayName || currentUser.email || 'User'}` }}
          style={styles.profileImage}
        />
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>150</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>1.2k</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>300</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
        </View>
      </View>

      <View style={styles.userInfo}>
        <Text style={styles.userName}>{currentUser.displayName || 'Techmate User'}</Text>
        <Text style={styles.userEmail}>{currentUser.email}</Text>
      </View>

      <TouchableOpacity style={styles.editProfileButton}>
        <Text style={styles.editProfileButtonText}>Edit Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionButton} onPress={handleLogout}>
        <Icon name="log-out-outline" size={22} color="#ff3b30" />
        <Text style={[styles.actionButtonText, { color: '#ff3b30' }]}>Log Out</Text>
      </TouchableOpacity>

      {/* Placeholder for other profile actions */}
      {/* <TouchableOpacity style={styles.actionButton}>
        <Icon name="settings-outline" size={22} color="#555" />
        <Text style={styles.actionButtonText}>Account Settings</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionButton}>
        <Icon name="bookmark-outline" size={22} color="#555" />
        <Text style={styles.actionButtonText}>Saved Posts</Text>
      </TouchableOpacity> */}
    </View>
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fafafa',
  },
  notLoggedInTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#262626',
    marginTop: 15,
    marginBottom: 8,
  },
  notLoggedInSubtitle: {
    fontSize: 16,
    color: '#8e8e8e',
    textAlign: 'center',
    marginBottom: 30,
  },
  authButton: {
    width: '80%',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  loginButton: {
    backgroundColor: '#0095f6', // Instagram blue
  },
  authButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#dbdbdb',
    backgroundColor: '#fff',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 20,
    borderWidth: 1,
    borderColor: '#dbdbdb',
  },
  statsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#262626',
  },
  statLabel: {
    fontSize: 14,
    color: '#8e8e8e',
    marginTop: 2,
  },
  userInfo: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#fff', // Keep user info section clean
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#262626',
  },
  userEmail: {
    fontSize: 14,
    color: '#8e8e8e',
    marginTop: 2,
    marginBottom: 10,
  },
  editProfileButton: {
    marginHorizontal: 15,
    marginTop: 15,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dbdbdb',
    borderRadius: 8,
    alignItems: 'center',
  },
  editProfileButtonText: {
    fontWeight: '600',
    color: '#262626',
    fontSize: 15,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 15,
    marginTop: 15, // Spacing for action buttons
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#fff', // Buttons on white background
    borderWidth: 1,
    borderColor: '#dbdbdb',
    borderRadius: 8,
  },
  actionButtonText: {
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 12,
    color: '#262626', // Default text color for actions
  },
});

export default ProfileScreen;
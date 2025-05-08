// app/screens/HomeScreen.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { signOut } from 'firebase/auth';
import { FIREBASE_AUTH } from '../../firebaseConfig';
// Removed useNavigation and RootStackParamList as navigation is now handled differently
// If you need to navigate to CreatePost or Messenger from here (e.g. a story),
// you'd use TabScreenProps and navigation.navigate from RootStackParamList

// No need for specific navigation prop type here for basic display
// If you need to navigate from here to other Stack screens (CreatePost, Messenger)
// you'd import and use TabScreenProps<'HomeTab'> and its navigation prop.

const HomeScreen = () => {
  const auth = FIREBASE_AUTH;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      Alert.alert('Success', 'Signed out successfully!');
      // AppNavigator will handle navigation to Login screen on auth state change
    } catch (error: any) {
      Alert.alert('Logout Error', error.message);
    }
  };

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <Text style={styles.title}>Welcome to Techmates Feed!</Text>
        <Text style={styles.subtitle}>Here's what's new...</Text>
        {/* Example Content - Replace with your actual feed components */}
        <View style={styles.postPlaceholder}>
          <Text>Post 1 by UserA</Text>
        </View>
        <View style={styles.postPlaceholder}>
          <Text>Post 2 by UserB</Text>
        </View>
        <View style={styles.postPlaceholder}>
          <Text>Post 3 by UserC</Text>
        </View>
        
        {/* Logout button can be moved to ProfileScreen if preferred */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Log Out (Temp)</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#fafafa', // Instagram-like background
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#262626',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8e8e8e',
    marginBottom: 20,
  },
  postPlaceholder: {
    width: '100%',
    height: 300, // Example height
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dbdbdb',
    borderRadius: 3,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButton: {
    marginTop: 20,
    backgroundColor: '#0095f6', // Instagram blue
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 5,
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
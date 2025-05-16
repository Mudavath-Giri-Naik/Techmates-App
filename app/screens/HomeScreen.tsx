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
      </View>
    </ScrollView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Instagram-like background
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 10,
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
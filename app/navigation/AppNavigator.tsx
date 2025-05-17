// app/navigation/AppNavigator.tsx
import React, { useState, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';
import { supabase } from '../../utils/supabase';
import { Session } from '@supabase/supabase-js';
// We might still need User and onAuthStateChanged if ProfileScreen needs to react to login events
// but the core navigation won't depend on it at this level anymore.
// import { User, onAuthStateChanged } from 'firebase/auth';
// import { FIREBASE_AUTH } from '../../firebaseConfig';

import LoginScreen from '../screens/LoginScreen'; // Keep LoginScreen for navigation from Profile
import TabNavigator from './TabNavigator';       // This will now be the primary component
import CreatePostScreen from '../screens/CreatePostScreen';
import MessengerScreen from '../screens/MessengerScreen';
import StudentProfile from '../screens/StudentProfile';
import ProfileScreen from '../screens/ProfileScreen';
import CommentsScreen from '../screens/CommentsScreen';

import { RootStackParamList } from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName={session ? "MainApp" : "Login"}
    >
      {/* MainApp (TabNavigator) is now the default entry */}
      <Stack.Screen
        name="MainApp"
        component={TabNavigator}
      />
      {/* LoginScreen is available for navigation but not initial */}
      <Stack.Screen
        name="Login"
        component={LoginScreen}
      />
      {/* Other stack screens like CreatePost and Messenger remain */}
      <Stack.Screen
        name="CreatePost"
        component={CreatePostScreen}
        options={{ 
          headerShown: true,
          title: 'Create Post' 
        }}
      />
      <Stack.Screen
        name="Messenger"
        component={MessengerScreen}
        options={{ 
          headerShown: true,
          title: 'Messages' 
        }}
      />
      <Stack.Screen
        name="StudentProfile"
        component={StudentProfile}
        options={{ 
          headerShown: false
        }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerShown: true,
          title: 'My Profile'
        }}
      />
      <Stack.Screen
        name="Comments"
        component={CommentsScreen}
        options={{ title: 'Comments' }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
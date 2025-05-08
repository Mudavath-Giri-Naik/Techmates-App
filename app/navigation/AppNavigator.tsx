// app/navigation/AppNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
// We might still need User and onAuthStateChanged if ProfileScreen needs to react to login events
// but the core navigation won't depend on it at this level anymore.
// import { User, onAuthStateChanged } from 'firebase/auth';
// import { FIREBASE_AUTH } from '../../firebaseConfig';

import LoginScreen from '../screens/LoginScreen'; // Keep LoginScreen for navigation from Profile
import TabNavigator from './TabNavigator';       // This will now be the primary component
import CreatePostScreen from '../screens/CreatePostScreen';
import MessengerScreen from '../screens/MessengerScreen';

import { RootStackParamList } from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  // No longer managing user state at this top level for initial routing
  // const [user, setUser] = useState<User | null>(null);
  // const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (authenticatedUser) => {
  //     setUser(authenticatedUser);
  //     setLoading(false);
  //   });
  //   return unsubscribe;
  // }, []);

  // if (loading) {
  //   return (
  //     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
  //       <ActivityIndicator size="large" />
  //     </View>
  //   );
  // }

  return (
    <Stack.Navigator
      initialRouteName="MainApp" // <<<<<<<< KEY CHANGE: Start with MainApp
    >
      {/* MainApp (TabNavigator) is now the default entry */}
      <Stack.Screen
        name="MainApp"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      {/* LoginScreen is available for navigation but not initial */}
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }} // Or customize as needed, e.g., for a modal presentation
      />
      {/* Other stack screens like CreatePost and Messenger remain */}
      <Stack.Screen
        name="CreatePost"
        component={CreatePostScreen}
        options={{ title: 'Create Post' }}
      />
      <Stack.Screen
        name="Messenger"
        component={MessengerScreen}
        options={{ title: 'Messages' }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
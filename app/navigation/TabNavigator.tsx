// app/navigation/TabNavigator.tsx
import React from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native'; // Import StyleSheet and TouchableOpacity
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import { Vibration } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// For more precise safe area handling, you might install and use:
// import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import ResourcesScreen from '../screens/ResourcesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CustomHeader from '../components/CustomHeader';
import { TabParamList } from '../types';

const Tab = createBottomTabNavigator<TabParamList>();

// Define heights for the visual content area of the tab bar.
// Icons and interactive elements will be within this height.
// React Navigation typically handles adding space for OS elements like the iPhone home indicator.
const IOS_TAB_CONTENT_HEIGHT = 60; // Increased height for larger icons
const ANDROID_TAB_CONTENT_HEIGHT = 65; // Increased height for larger icons

const TabNavigator = () => {
  const insets = useSafeAreaInsets();
  const tabBarContentHeight = (Platform.OS === 'ios' ? IOS_TAB_CONTENT_HEIGHT : ANDROID_TAB_CONTENT_HEIGHT) + insets.bottom;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color }) => {
          let iconName: string = '';
          // Increased icon size for better visibility
          const iconSize = Platform.OS === 'ios' ? 32 : 30;

          switch (route.name) {
            case 'HomeTab':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'SearchTab':
              iconName = focused ? 'search' : 'search-outline';
              break;
            case 'ResourcesTab':
              iconName = focused ? 'newspaper' : 'newspaper-outline';
              break;
            case 'ChatTab':
              iconName = focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline';
              break;
          }
          return <Icon name={iconName} size={iconSize} color={color} />;
        },
        tabBarActiveTintColor: '#4A90E2', // Professional blue color for active state
        tabBarInactiveTintColor: '#A0AEC0', // Subtle gray for inactive state
        tabBarShowLabel: false,
        header: ({ route }) => {
          if (route.name === 'HomeTab') {
            return <CustomHeader />;
          }
          return null;
        },
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          height: tabBarContentHeight,
          borderTopWidth: Platform.OS === 'ios' ? StyleSheet.hairlineWidth : 0,
          borderTopColor: Platform.OS === 'ios' ? '#FFFFFF' : undefined,
          elevation: Platform.OS === 'android' ? 0 : 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 1,
          paddingBottom: insets.bottom,
        },
        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: 8,
        },
        tabBarPressColor: 'transparent', // Remove ripple effect on Android
        tabBarButton: (props) => (
          <TouchableOpacity
            {...(props as React.ComponentProps<typeof TouchableOpacity>)}
            activeOpacity={1}
            onPress={(e) => {
              Vibration.vibrate(15);
              props.onPress?.(e);
            }}
            style={props.style}
          />
        ),
      })}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <Icon 
              name={focused ? 'home' : 'home-outline'} 
              size={30} 
              color={color} 
            />
          ),
        }}
      />
      <Tab.Screen 
        name="SearchTab" 
        component={SearchScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <Icon 
              name={focused ? 'search' : 'search-outline'} 
              size={30} 
              color={color} 
            />
          ),
        }}
      />
      <Tab.Screen 
        name="ResourcesTab" 
        component={ResourcesScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <Icon 
              name={focused ? 'newspaper' : 'newspaper-outline'} 
              size={30} 
              color={color} 
            />
          ),
        }}
      />
      <Tab.Screen 
        name="ChatTab" 
        component={() => <View />} // Replace with your ChatScreen
        options={{
          tabBarIcon: ({ focused, color }) => (
            <Icon 
              name={focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline'} 
              size={30} 
              color={color} 
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;


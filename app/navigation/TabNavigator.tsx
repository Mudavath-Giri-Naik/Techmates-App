// app/navigation/TabNavigator.tsx
import React from 'react';
import { Platform, StyleSheet } from 'react-native'; // Import StyleSheet
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';

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
const IOS_TAB_CONTENT_HEIGHT = 50;
const ANDROID_TAB_CONTENT_HEIGHT = 60; // Android Material Design guidelines often suggest 56dp or 60dp

const TabNavigator = () => {
  // If you install 'react-native-safe-area-context', you can use insets for more precise control:
  // const insets = useSafeAreaInsets();
  // const tabBarActualHeight = (Platform.OS === 'ios' ? IOS_TAB_CONTENT_HEIGHT + insets.bottom : ANDROID_TAB_CONTENT_HEIGHT);

  const tabBarContentHeight = Platform.OS === 'ios' ? IOS_TAB_CONTENT_HEIGHT : ANDROID_TAB_CONTENT_HEIGHT;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color }) => {
          let iconName: string = '';
          // Icon size should be comfortable within the tabBarContentHeight.
          const iconSize = Platform.OS === 'ios' ? 28 : 26;

          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'SearchTab') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'ResourcesTab') {
            iconName = focused ? 'newspaper' : 'newspaper-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'person-circle' : 'person-circle-outline';
          }
          return <Icon name={iconName} size={iconSize} color={color} />;
        },
        tabBarActiveTintColor: '#000000', // Pure black for active icons
        tabBarInactiveTintColor: '#8e8e8e', // Standard grey for inactive icons
        tabBarShowLabel: false, // Mimics Instagram's icon-only tab bar
        header: () => <CustomHeader />, // Your custom header for screens
        tabBarStyle: {
          backgroundColor: '#ffffff', // Clean white background
          height: tabBarContentHeight, // Set the height for the icon area

          // Border for iOS, elevation for Android provides a professional separation
          borderTopWidth: Platform.OS === 'ios' ? StyleSheet.hairlineWidth : 0,
          borderTopColor: Platform.OS === 'ios' ? '#dbdbdb' : undefined, // Light grey border for iOS

          elevation: Platform.OS === 'android' ? 4 : 0, // Subtle shadow for Android Material Design

        },
        // Ensures icons are vertically centered within the tab bar item,
        // especially important if tabBarContentHeight is customized.
        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} />
      <Tab.Screen name="SearchTab" component={SearchScreen} />
      <Tab.Screen name="ResourcesTab" component={ResourcesScreen} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default TabNavigator;


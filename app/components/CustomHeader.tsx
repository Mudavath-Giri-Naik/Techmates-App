// app/components/CustomHeader.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
  Image,
  Vibration,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { RootStackNavigatorProp } from '../types';

// Approximate status bar height for iOS (especially for notched devices)
const IOS_STATUS_BAR_HEIGHT = 44;
// Standard height for the main content area of the header (logo, icons)
const HEADER_CONTENT_AREA_HEIGHT = 60;

const CustomHeader = () => {
  const navigation = useNavigation<RootStackNavigatorProp>();

  // Calculate paddingTop for Android dynamically
  const androidStatusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;

  return (
    <View
      style={[
        styles.headerOuterContainer,
        {
          height:
            (Platform.OS === 'ios' ? IOS_STATUS_BAR_HEIGHT : androidStatusBarHeight) + HEADER_CONTENT_AREA_HEIGHT,
          paddingTop: Platform.OS === 'ios' ? IOS_STATUS_BAR_HEIGHT : androidStatusBarHeight,
        },
      ]}
    >
      {/* This StatusBar component ensures the text/icons in the actual device status bar are dark */}
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={Platform.OS === 'android'} />

      <View style={styles.headerInnerContainer}>
        {/* Left: Notifications */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => {
            Vibration.vibrate(10);
            navigation.navigate('MainApp', { screen: 'HomeTab' });
          }}
        >
          <Icon name="notifications-outline" size={28} color="#FF6B00" />
        </TouchableOpacity>
        {/* Center: Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoBaseText}>
            <Text style={styles.logoTech}>Tech</Text>
            <Text style={styles.logoMates}>mates</Text>
          </Text>
        </View>
        {/* Right: Profile Avatar */}
        <TouchableOpacity
          style={styles.avatarButton}
          onPress={() => {
            Vibration.vibrate(10);
            navigation.navigate('Profile');
          }}
        >
          <Icon name="person-circle" size={32} color="#4A90E2" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerOuterContainer: {
    backgroundColor: '#FFFFFF', // White background extends to status bar area
    // `height` and `paddingTop` are set dynamically in the component
  },
  headerInnerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    height: HEADER_CONTENT_AREA_HEIGHT, // Ensures this inner container has a fixed height for content
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBaseText: {
    fontSize: 25, // Adjust as needed
    // The fontFamily will be applied to both parts unless overridden
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif', // Using 'sans-serif' for a common Android default
    fontWeight: 'bold',
  },
  logoTech: {
    color: '#000000', // Black
  },
  logoMates: {
    color: '#FF0000', // Red
  },
  iconButton: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#FFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  avatarButton: {
    padding: 4,
    borderRadius: 20,
    backgroundColor: '#FFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
});

export default CustomHeader;
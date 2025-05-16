// app/components/CustomHeader.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
  ScrollView,
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

const CATEGORIES = [
  'Home',
  'Opportunities',
  'Events',
  'Competitions',
  'Achievements',
  'Hackathons',
];

const CustomHeader = () => {
  const navigation = useNavigation<RootStackNavigatorProp>();
  const [selectedCategory, setSelectedCategory] = useState('Home');

  // Calculate paddingTop for Android dynamically
  const androidStatusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;

  const handleCategoryPress = (category: string) => {
    Vibration.vibrate(10);
    setSelectedCategory(category);
    // Optionally, trigger navigation or filtering here
  };

  return (
    <View
      style={[
        styles.headerOuterContainer,
        {
          height:
            (Platform.OS === 'ios' ? IOS_STATUS_BAR_HEIGHT : androidStatusBarHeight) + HEADER_CONTENT_AREA_HEIGHT + 56,
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
      {/* Category Chips */}
      <View style={styles.chipScrollContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.chip,
                selectedCategory === cat && styles.chipSelected,
              ]}
              onPress={() => handleCategoryPress(cat)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.chipText,
                  selectedCategory === cat && styles.chipTextSelected,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
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
  chipScrollContainer: {
    marginTop: 8,
    paddingLeft: 8,
    paddingRight: 8,
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chip: {
    backgroundColor: '#F5F6FA',
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  chipSelected: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
    elevation: 2,
    shadowOpacity: 0.12,
  },
  chipText: {
    color: '#1A202C',
    fontSize: 15,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#FFF',
    fontWeight: '700',
  },
});

export default CustomHeader;
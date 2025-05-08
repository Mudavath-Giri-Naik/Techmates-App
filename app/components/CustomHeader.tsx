// app/components/CustomHeader.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, StatusBar } from 'react-native';
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
    <View style={[
        styles.headerOuterContainer,
        {
          height: (Platform.OS === 'ios' ? IOS_STATUS_BAR_HEIGHT : androidStatusBarHeight) + HEADER_CONTENT_AREA_HEIGHT,
          paddingTop: Platform.OS === 'ios' ? IOS_STATUS_BAR_HEIGHT : androidStatusBarHeight,
        }
      ]}
    >
      {/* This StatusBar component ensures the text/icons in the actual device status bar are dark */}
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={Platform.OS === 'android'} />

      <View style={styles.headerInnerContainer}>
        {/* Logo View */}
        <View>
          <Text style={styles.logoBaseText}>
            <Text style={styles.logoTech}>Tech</Text>
            <Text style={styles.logoMates}>mates</Text>
          </Text>
        </View>

        {/* Icons View */}
        <View style={styles.iconsContainer}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('CreatePost')}
          >
            <Icon name="add-circle-outline" size={28} color="#000000" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('Messenger')}
          >
            <Icon name="paper-plane-outline" size={28} color="#000000" />
          </TouchableOpacity>
        </View>
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
    flex: 1, // Takes up the space below the paddingTop
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center', // Vertically center logo and icons
    paddingHorizontal: 15,
    
    height: HEADER_CONTENT_AREA_HEIGHT, // Ensures this inner container has a fixed height for content
  },
  logoBaseText: {
    fontSize: 25, // Adjust as needed
    // The fontFamily will be applied to both parts unless overridden
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif', // Using 'sans-serif' for a common Android default
  },
  logoTech: {
    fontWeight: 'bold',
    color: '#000000', // Black
  },
  logoMates: {
    fontWeight: 'bold',
    color: '#FF0000', // Red
  },
  iconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: 18, // Slightly reduced spacing for a tighter look if desired
    padding: 4,     // Adds a bit of touchable area around the icon
  },
});

export default CustomHeader;
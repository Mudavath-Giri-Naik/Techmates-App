// app/screens/SearchScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, TextInput, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
// import { TabScreenProps } from '../types'; // If you need navigation

// type SearchScreenNavigationProps = TabScreenProps<'SearchTab'>; // If needed

const SearchScreen = (/* { navigation }: SearchScreenNavigationProps */) => {
  // Example search results
  const suggestedSearches = [
    { id: '1', term: 'React Native Tutorials' },
    { id: '2', term: 'Firebase Auth' },
    { id: '3', term: 'Expo Development' },
    { id: '4', term: 'JavaScript Tips' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.searchBarContainer}>
        <Icon name="search-outline" size={20} color="#8e8e8e" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search Techmates"
          placeholderTextColor="#8e8e8e"
        />
      </View>
      {/* For Instagram, this would be a grid of posts, for now, just a list */}
      <FlatList
        data={suggestedSearches /* Or actual search results */}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.gridItem}>
            <Text>{item.term}</Text>
          </View>
        )}
        numColumns={3} // Example for a grid layout
        contentContainerStyle={styles.gridContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#efefef', // Light gray for search bar
    paddingHorizontal: 10,
    margin: 10,
    borderRadius: 10,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#262626',
  },
  gridContainer: {
    paddingHorizontal: 2,
  },
  gridItem: {
    flex: 1,
    margin: 2,
    aspectRatio: 1, // Makes it a square
    backgroundColor: '#e0e0e0', // Placeholder for image/video
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SearchScreen;
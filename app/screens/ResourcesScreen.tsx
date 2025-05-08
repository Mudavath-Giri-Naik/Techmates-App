// app/screens/ResourcesScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Linking } from 'react-native';
// import { TabScreenProps } from '../types';

// type ResourcesScreenNavigationProps = TabScreenProps<'ResourcesTab'>;

const resourcesData = [
  { id: '1', title: 'React Native Docs', url: 'https://reactnative.dev/docs/getting-started' },
  { id: '2', title: 'Expo Docs', url: 'https://docs.expo.dev/' },
  { id: '3', title: 'Firebase for React Native', url: 'https://firebase.google.com/docs/web/setup' },
  { id: '4', title: 'Techmates Community Forum (Example)', url: 'https://example.com/forum' },
];

const ResourcesScreen = (/* { navigation }: ResourcesScreenNavigationProps */) => {
  const renderItem = ({ item }: { item: typeof resourcesData[0] }) => (
    <TouchableOpacity style={styles.itemContainer} onPress={() => Linking.openURL(item.url)}>
      <Text style={styles.itemTitle}>{item.title}</Text>
      <Text style={styles.itemUrl} numberOfLines={1}>{item.url}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Helpful Resources</Text>
      <FlatList
        data={resourcesData}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#262626',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#dbdbdb',
  },
  itemContainer: {
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#262626',
  },
  itemUrl: {
    fontSize: 14,
    color: '#00376b', // Link color
    marginTop: 4,
  },
  separator: {
    height: 1,
    backgroundColor: '#dbdbdb',
    marginLeft: 15,
  },
});

export default ResourcesScreen;
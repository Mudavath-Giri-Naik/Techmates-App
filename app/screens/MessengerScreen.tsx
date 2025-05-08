// app/screens/MessengerScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, Button, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootStackNavigatorProp } from '../types';

const dummyConversations = [
  { id: '1', name: 'Alice', lastMessage: 'Hey, how are you?' },
  { id: '2', name: 'Bob', lastMessage: 'See you tomorrow!' },
  { id: '3', name: 'Charlie', lastMessage: 'Check this out.' },
];

const MessengerScreen = () => {
  const navigation = useNavigation<RootStackNavigatorProp>();

  return (
    <View style={styles.container}>
      <FlatList
        data={dummyConversations}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.chatItem}>
            <Text style={styles.chatName}>{item.name}</Text>
            <Text style={styles.chatLastMessage}>{item.lastMessage}</Text>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
      {/* <Button title="Go Back" onPress={() => navigation.goBack()} /> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  chatItem: {
    padding: 15,
  },
  chatName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  chatLastMessage: {
    fontSize: 14,
    color: 'gray',
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
    marginLeft: 15,
  }
});

export default MessengerScreen;
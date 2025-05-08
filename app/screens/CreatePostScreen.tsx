
// app/screens/CreatePostScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootStackNavigatorProp } from '../types';

const CreatePostScreen = () => {
  const navigation = useNavigation<RootStackNavigatorProp>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create New Post</Text>
      <Text style={styles.text}>Select photo/video, add caption, etc.</Text>
      {/* Add your image picker and form here */}
      <Button title="Go Back" onPress={() => navigation.goBack()} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
  }
});

export default CreatePostScreen;
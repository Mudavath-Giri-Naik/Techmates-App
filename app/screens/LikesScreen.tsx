import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { supabase } from '../../utils/supabase';
import { RootStackNavigatorProp } from '../types';

interface Like {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
  user: {
    id: string;
    name: string;
    profile_image: string;
    college_name: string;
  };
}

const LikesScreen = () => {
  const route = useRoute();
  const navigation = useNavigation<RootStackNavigatorProp>();
  const [likes, setLikes] = useState<Like[]>([]);
  const [loading, setLoading] = useState(true);
  const postId = (route.params as any).postId;

  useEffect(() => {
    fetchLikes();
  }, []);

  const fetchLikes = async () => {
    try {
      const { data, error } = await supabase
        .from('likes')
        .select(`
          *,
          user:Users(id, name, profile_image, college_name)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLikes(data || []);
    } catch (error) {
      console.error('Error fetching likes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePress = (userId: string) => {
    navigation.navigate('StudentProfile', { userId });
  };

  const renderLike = ({ item }: { item: Like }) => (
    <TouchableOpacity 
      style={styles.likeContainer}
      onPress={() => handleProfilePress(item.user.id)}
    >
      <Image
        source={{ 
          uri: item.user.profile_image || 
          `https://avatar.iran.liara.run/username?username=${item.user.name}`
        }}
        style={styles.avatar}
      />
      <View style={styles.userInfo}>
        <Text style={styles.username}>{item.user.name}</Text>
        <Text style={styles.college}>{item.user.college_name}</Text>
      </View>
      <Icon name="heart" size={20} color="#E53E3E" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={likes}
        renderItem={renderLike}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.likesList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="heart-outline" size={48} color="#CBD5E0" />
            <Text style={styles.emptyText}>No likes yet</Text>
            <Text style={styles.emptySubtext}>Be the first to like this post!</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  likesList: {
    padding: 16,
  },
  likeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A202C',
    marginBottom: 4,
  },
  college: {
    fontSize: 14,
    color: '#718096',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#718096',
    marginTop: 8,
  },
});

export default LikesScreen; 
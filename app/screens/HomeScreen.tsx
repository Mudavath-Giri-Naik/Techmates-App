// app/screens/HomeScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
  FlatList,
  Dimensions,
  ActivityIndicator,
  Modal,
  Pressable,
  Platform,
  StatusBar,
  Linking,
} from 'react-native';
import { signOut } from 'firebase/auth';
import { FIREBASE_AUTH } from '../../firebaseConfig';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackNavigatorProp, TabParamList } from '../types';
import Icon from 'react-native-vector-icons/Ionicons';
import { PostType, Post, Like } from '../types/post';
import { supabase } from '../../utils/supabase';
// Removed useNavigation and RootStackParamList as navigation is now handled differently
// If you need to navigate to CreatePost or Messenger from here (e.g. a story),
// you'd use TabScreenProps and navigation.navigate from RootStackParamList

// No need for specific navigation prop type here for basic display
// If you need to navigate from here to other Stack screens (CreatePost, Messenger)
// you'd import and use TabScreenProps<'HomeTab'> and its navigation prop.

const { width } = Dimensions.get('window');

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

type HomeScreenRouteProp = RouteProp<TabParamList, 'HomeTab'>;

const SUPABASE_URL = 'https://uokeycybgnulyhhcibcj.supabase.co/rest/v1/posts';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVva2V5Y3liZ251bHloaGNpYmNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyNjc3MTMsImV4cCI6MjA2Mjg0MzcxM30.ks7qEIAp2lll4rBXRkw7SqrwCpJZRo3Mq8Gwpq6lIEY';

interface RawPost {
  id: string;
  user_id: string;
  type: PostType;
  title: string;
  description: string;
  images: string[];
  created_at: string;
  updated_at: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  likes: Like[];
  users: {
    id: string;
    email_id: string;
    name: string;
    college_name: string;
    course_name: string;
    location: string;
    leetcode_link: string;
    github_link: string;
    linkedin_link: string;
    instagram_link: string;
    profile_image: string;
  };
  company?: string;
  role?: string;
  salary?: string;
  application_link?: string;
  requirements?: string[];
  venue?: string;
  organizer?: string;
  registration_link?: string;
  max_participants?: number;
  prize?: string;
  rules?: string[];
  theme?: string;
  technologies?: string[];
  category?: string;
  achievement_date?: string;
  achievement_link?: string;
  start_date?: string;
  end_date?: string;
  location?: string;
}

interface User {
  id: string;
  email_id: string;
  name: string;
  college_name: string;
  course_name: string;
  location: string;
  leetcode_link: string;
  github_link: string;
  linkedin_link: string;
  instagram_link: string;
  profile_image: string;
}

const HomeScreen = () => {
  const auth = FIREBASE_AUTH;
  const navigation = useNavigation<RootStackNavigatorProp>();
  const route = useRoute<HomeScreenRouteProp>();
  const [modalVisible, setModalVisible] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Home');

  // Calculate paddingTop for Android dynamically
  const androidStatusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;

  // Listen for category changes from CustomHeader
  useEffect(() => {
    const params = route.params as unknown as { selectedCategory?: string };
    if (params?.selectedCategory) {
      setSelectedCategory(params.selectedCategory);
    }
  }, [route.params]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      Alert.alert('Success', 'Signed out successfully!');
      // AppNavigator will handle navigation to Login screen on auth state change
    } catch (error: any) {
      Alert.alert('Logout Error', error.message);
    }
  };

  const fetchPosts = async () => {
    try {
      console.log('=== DEBUG: Starting fetchPosts ===');
      console.log('Selected Category:', selectedCategory);
      
      // Convert category name to lowercase and remove 's' for plural forms
      const normalizedCategory = selectedCategory.toLowerCase().replace(/s$/, '');
      console.log('Normalized Category:', normalizedCategory);
      
      // Construct the URL based on the selected category
      let url = SUPABASE_URL;
      if (selectedCategory !== 'Home') {
        url += `?type=eq.${normalizedCategory}`;
      } else {
        url += `?type=eq.normal`;
      }
      
      console.log('=== DEBUG: API Request ===');
      console.log('URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
      });

      console.log('=== DEBUG: API Response ===');
      console.log('Status:', response.status);
      console.log('Status Text:', response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error Response Body:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const rawPosts = await response.json() as RawPost[];
      console.log('=== DEBUG: Raw Posts ===');
      console.log('Number of posts received:', rawPosts?.length || 0);

      if (!rawPosts || rawPosts.length === 0) {
        console.log('=== DEBUG: No Posts Found ===');
        console.log('Category:', selectedCategory);
        console.log('Normalized Category:', normalizedCategory);
        setPosts([]);
        return;
      }

      // Fetch user data for all posts
      const userIds = rawPosts.map(post => post.user_id);
      const uniqueUserIds = [...new Set(userIds)];
      
      console.log('Fetching user data for IDs:', uniqueUserIds);
      
      const usersResponse = await fetch(`${SUPABASE_URL.replace('/posts', '/users')}?id=in.(${uniqueUserIds.join(',')})`, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (!usersResponse.ok) {
        throw new Error(`Failed to fetch user data: ${usersResponse.status}`);
      }

      const users = await usersResponse.json() as User[];
      const userMap = new Map(users.map(user => [user.id, user]));

      console.log('=== DEBUG: Transforming Posts ===');
      // Transform the posts with user data
      const transformedPosts = rawPosts.map((post: RawPost, index: number) => {
        console.log(`Transforming post ${index + 1}/${rawPosts.length}:`, {
          id: post.id,
          type: post.type,
          title: post.title
        });
        
        const userData = userMap.get(post.user_id);
        console.log(`User data for post ${index + 1}:`, userData ? {
          id: userData.id,
          name: userData.name,
          email: userData.email_id
        } : 'No user data');

        const transformedPost = {
          ...post,
          user: {
            id: userData?.id || '',
            email: userData?.email_id || '',
            name: userData?.name || '',
            college: userData?.college_name || '',
            course: userData?.course_name || '',
            location: userData?.location || '',
            profileImage: userData?.profile_image ? 
              `data:image/jpeg;base64,${Buffer.from(userData.profile_image).toString('base64')}` : 
              'https://via.placeholder.com/40',
            socialLinks: {
              leetcode: userData?.leetcode_link || '',
              github: userData?.github_link || '',
              linkedin: userData?.linkedin_link || '',
              instagram: userData?.instagram_link || ''
            }
          },
          type: post.type as PostType,
          images: post.images || [],
          likes_count: post.likes_count || 0,
          comments_count: post.comments_count || 0,
          shares_count: post.shares_count || 0,
          requirements: post.requirements || [],
          rules: post.rules || [],
          technologies: post.technologies || [],
          likes: post.likes || [],
          company: post.company || '',
          role: post.role || '',
          salary: post.salary || '',
          application_link: post.application_link || '',
          venue: post.venue || '',
          organizer: post.organizer || '',
          registration_link: post.registration_link || '',
          max_participants: post.max_participants || 0,
          prize: post.prize || '',
          theme: post.theme || '',
          category: post.category || '',
          achievement_date: post.achievement_date || null,
          achievement_link: post.achievement_link || '',
          start_date: post.start_date || null,
          end_date: post.end_date || null
        } as Post;

        console.log(`Transformed post ${index + 1}:`, {
          id: transformedPost.id,
          type: transformedPost.type,
          title: transformedPost.title,
          user: transformedPost.user.name
        });

        return transformedPost;
      });

      console.log('=== DEBUG: Final Results ===');
      console.log('Number of transformed posts:', transformedPosts.length);
      console.log('First post sample:', transformedPosts[0] ? {
        id: transformedPosts[0].id,
        type: transformedPosts[0].type,
        title: transformedPosts[0].title,
        user: transformedPosts[0].user.name
      } : 'No posts');

      setPosts(transformedPosts);
    } catch (error) {
      console.error('=== DEBUG: Error in fetchPosts ===');
      console.error('Error:', error);
      if (error instanceof Error) {
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
        Alert.alert('Error', 'Failed to fetch posts: ' + error.message);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
      console.log('=== DEBUG: fetchPosts completed ===');
    }
  };

  // Remove the real-time subscription since we're using REST API
  useEffect(() => {
    console.log('Category changed, fetching posts...');
    fetchPosts();
  }, [selectedCategory]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPosts();
  };

  const handleLike = async (postId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: existingLike } = await supabase
        .from('likes')
        .select()
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();

      if (existingLike) {
        await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('likes')
          .insert([{ post_id: postId, user_id: user.id }]);
      }

      fetchPosts(); // Refresh posts to update like count
    } catch (error) {
      console.error('Error toggling like:', error);
      Alert.alert('Error', 'Failed to update like');
    }
  };

  const handleComment = async (postId: string, content: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      await supabase
        .from('comments')
        .insert([{
          post_id: postId,
          user_id: user.id,
          content: content.trim(),
        }]);

      fetchPosts(); // Refresh posts to update comment count
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Error', 'Failed to add comment');
    }
  };

  const handleShare = async (postId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      await supabase
        .from('shares')
        .insert([{ post_id: postId, user_id: user.id }]);

      Alert.alert('Success', 'Post shared successfully!');
    } catch (error) {
      console.error('Error sharing post:', error);
      Alert.alert('Error', 'Failed to share post');
    }
  };

  const handleProfilePress = (userId: string) => {
    navigation.navigate('StudentProfile', { 
      userId,
      showBackButton: true
    });
  };

  const handleCategoryPress = (category: string) => {
    console.log('Category pressed:', category);
    setSelectedCategory(category);
  };

  const renderPost = ({ item: post }: { item: Post }) => {
    const isLiked = post.likes.some((like: Like) => like.user_id === post.user_id);

    return (
      <View style={styles.postContainer}>
        {/* Post Header */}
        <TouchableOpacity 
          style={styles.postHeader}
          onPress={() => handleProfilePress(post.user_id)}
        >
          <Image
            source={{ uri: post.user.profileImage }}
            style={styles.avatar}
          />
          <View style={styles.postHeaderInfo}>
            <Text style={styles.username}>{post.user.name}</Text>
            <Text style={styles.userInfo}>{post.user.college}</Text>
          </View>
        </TouchableOpacity>

        {/* Post Content */}
        <View style={styles.postContent}>
          <Text style={styles.postTitle}>{post.title}</Text>
          <Text style={styles.postDescription}>{post.description}</Text>
          
          {/* Post Type Specific Details */}
          {post.type === 'opportunity' && (
            <View style={styles.postDetails}>
              <Text style={styles.detailText}>Company: {post.company}</Text>
              <Text style={styles.detailText}>Role: {post.role}</Text>
              <Text style={styles.detailText}>Location: {post.location}</Text>
              {post.salary && <Text style={styles.detailText}>Salary: {post.salary}</Text>}
              {post.requirements && post.requirements.length > 0 && (
                <View>
                  <Text style={styles.detailText}>Requirements:</Text>
                  {post.requirements.map((req, index) => (
                    <Text key={index} style={styles.requirementText}>• {req}</Text>
                  ))}
                </View>
              )}
              {post.application_link && (
                <TouchableOpacity 
                  style={styles.linkButton}
                  onPress={() => post.application_link && Linking.openURL(post.application_link)}
                >
                  <Text style={styles.linkButtonText}>Apply Now</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {post.type === 'event' && (
            <View style={styles.postDetails}>
              <Text style={styles.detailText}>Venue: {post.venue}</Text>
              <Text style={styles.detailText}>Organizer: {post.organizer}</Text>
              {post.start_date && (
                <Text style={styles.detailText}>
                  Start Date: {new Date(post.start_date).toLocaleDateString()}
                </Text>
              )}
              {post.end_date && (
                <Text style={styles.detailText}>
                  End Date: {new Date(post.end_date).toLocaleDateString()}
                </Text>
              )}
              {post.max_participants && (
                <Text style={styles.detailText}>Max Participants: {post.max_participants}</Text>
              )}
              {post.registration_link && (
                <TouchableOpacity 
                  style={styles.linkButton}
                  onPress={() => post.registration_link && Linking.openURL(post.registration_link)}
                >
                  <Text style={styles.linkButtonText}>Register Now</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {post.type === 'competition' && (
            <View style={styles.postDetails}>
              <Text style={styles.detailText}>Prize: {post.prize}</Text>
              {post.start_date && (
                <Text style={styles.detailText}>
                  Start Date: {new Date(post.start_date).toLocaleDateString()}
                </Text>
              )}
              {post.end_date && (
                <Text style={styles.detailText}>
                  End Date: {new Date(post.end_date).toLocaleDateString()}
                </Text>
              )}
              {post.rules && post.rules.length > 0 && (
                <View>
                  <Text style={styles.detailText}>Rules:</Text>
                  {post.rules.map((rule, index) => (
                    <Text key={index} style={styles.requirementText}>• {rule}</Text>
                  ))}
                </View>
              )}
              {post.registration_link && (
                <TouchableOpacity 
                  style={styles.linkButton}
                  onPress={() => post.registration_link && Linking.openURL(post.registration_link)}
                >
                  <Text style={styles.linkButtonText}>Register Now</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {post.type === 'hackathon' && (
            <View style={styles.postDetails}>
              <Text style={styles.detailText}>Theme: {post.theme}</Text>
              <Text style={styles.detailText}>Prize: {post.prize}</Text>
              {post.start_date && (
                <Text style={styles.detailText}>
                  Start Date: {new Date(post.start_date).toLocaleDateString()}
                </Text>
              )}
              {post.end_date && (
                <Text style={styles.detailText}>
                  End Date: {new Date(post.end_date).toLocaleDateString()}
                </Text>
              )}
              {post.technologies && post.technologies.length > 0 && (
                <View>
                  <Text style={styles.detailText}>Technologies:</Text>
                  {post.technologies.map((tech, index) => (
                    <Text key={index} style={styles.requirementText}>• {tech}</Text>
                  ))}
                </View>
              )}
              {post.registration_link && (
                <TouchableOpacity 
                  style={styles.linkButton}
                  onPress={() => post.registration_link && Linking.openURL(post.registration_link)}
                >
                  <Text style={styles.linkButtonText}>Register Now</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {post.type === 'achievement' && (
            <View style={styles.postDetails}>
              <Text style={styles.detailText}>Category: {post.category}</Text>
              {post.achievement_date && (
                <Text style={styles.detailText}>
                  Date: {new Date(post.achievement_date).toLocaleDateString()}
                </Text>
              )}
              {post.achievement_link && (
                <TouchableOpacity 
                  style={styles.linkButton}
                  onPress={() => post.achievement_link && Linking.openURL(post.achievement_link)}
                >
                  <Text style={styles.linkButtonText}>View Achievement</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Post Images */}
        {post.images && post.images.length > 0 && (
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.imageScrollView}
          >
            {post.images.map((image, index) => (
              <Image
                key={index}
                source={{ uri: image }}
                style={styles.postImage}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
        )}

        {/* Post Actions */}
        <View style={styles.postActions}>
          <TouchableOpacity onPress={() => handleLike(post.id)}>
            <Icon
              name={isLiked ? 'heart' : 'heart-outline'}
              size={24}
              color={isLiked ? '#ff3040' : '#000'}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Comments', { postId: post.id })}>
            <Icon name="chatbubble-outline" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleShare(post.id)}>
            <Icon name="share-outline" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Post Stats */}
        <View style={styles.postStats}>
          <Text style={styles.likesCount}>{post.likes_count || 0} likes</Text>
          <Text style={styles.commentsCount}>{post.comments_count || 0} comments</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Category Chips */}
      <View style={[
        styles.chipScrollContainer,
        {
          paddingTop: Platform.OS === 'ios' ? IOS_STATUS_BAR_HEIGHT : androidStatusBarHeight,
        }
      ]}>
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

      {loading ? (
        <ActivityIndicator size="large" color="#0095f6" style={styles.loader} />
      ) : posts.length === 0 ? (
        <View style={styles.noPostsContainer}>
          <Icon name="document-text-outline" size={48} color="#ccc" />
          <Text style={styles.noPostsText}>No {selectedCategory.toLowerCase()} posts available</Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Create Post Button */}
      <TouchableOpacity
        style={styles.createPostButton}
        onPress={() => setModalVisible(true)}
      >
        <Icon name="add-circle" size={24} color="#0095f6" />
        <Text style={styles.createPostText}>Create Post</Text>
      </TouchableOpacity>

      {/* Post Type Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Post Type</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.postTypeGrid}>
              {[
                { type: 'normal', icon: 'document-text-outline', label: 'Normal Post' },
                { type: 'opportunity', icon: 'briefcase-outline', label: 'Opportunity' },
                { type: 'event', icon: 'calendar-outline', label: 'Event' },
                { type: 'competition', icon: 'trophy-outline', label: 'Competition' },
                { type: 'achievement', icon: 'ribbon-outline', label: 'Achievement' },
                { type: 'hackathon', icon: 'code-working-outline', label: 'Hackathon' },
              ].map((item) => (
                <TouchableOpacity
                  key={item.type}
                  style={styles.postTypeItem}
                  onPress={() => {
                    setModalVisible(false);
                    navigation.navigate('CreatePost', { postType: item.type });
                  }}
                >
                  <Icon name={item.icon} size={32} color="#0095f6" />
                  <Text style={styles.postTypeLabel}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postContainer: {
    marginBottom: 20,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  postHeaderInfo: {
    marginLeft: 10,
  },
  username: {
    fontWeight: '600',
    fontSize: 14,
  },
  userInfo: {
    color: '#666',
    fontSize: 12,
  },
  imageScrollView: {
    height: width,
  },
  postImage: {
    width: width,
    height: width,
  },
  postActions: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  postStats: {
    padding: 10,
  },
  likesCount: {
    fontWeight: '600',
    fontSize: 14,
  },
  commentsCount: {
    color: '#666',
    fontSize: 14,
    marginTop: 5,
  },
  postDescription: {
    padding: 10,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  commentsPreview: {
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  commentText: {
    fontSize: 14,
    marginBottom: 5,
  },
  viewAllComments: {
    color: '#666',
    fontSize: 14,
    marginTop: 5,
  },
  createPostButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  createPostText: {
    marginLeft: 8,
    color: '#0095f6',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  postTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  postTypeItem: {
    width: '48%',
    aspectRatio: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  postTypeLabel: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '600',
    color: '#212529',
    textAlign: 'center',
  },
  postContent: {
    padding: 15,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  postDetails: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#444',
    marginBottom: 4,
  },
  requirementText: {
    fontSize: 14,
    color: '#444',
    marginLeft: 8,
    marginBottom: 2,
  },
  chipScrollContainer: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 8,
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
  linkButton: {
    backgroundColor: '#4A90E2',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  linkButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  noPostsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noPostsText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
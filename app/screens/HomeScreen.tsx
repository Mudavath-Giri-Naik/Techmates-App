// app/screens/HomeScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
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
import { RootStackNavigatorProp, TabParamList, RootStackParamList } from '../types';
import Icon from 'react-native-vector-icons/Ionicons';
import { PostType } from '../types/post';
import { supabase } from '../../utils/supabase';
import { CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

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

const LIKES_URL = 'https://uokeycybgnulyhhcibcj.supabase.co/rest/v1/likes';
const COMMENTS_URL = 'https://uokeycybgnulyhhcibcj.supabase.co/rest/v1/comments';

interface RawPost {
id: string;
user_id: string;
type: string;
title: string;
description: string;
images: string[];
created_at: string;
updated_at: string;
likes_count: number;
comments_count: number;
shares_count: number;
likes: any[];
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

interface RawUser {
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

interface Like {
id: string;
post_id: string;
user_id: string;
created_at: string;
}

interface Comment {
id: string;
post_id: string;
user_id: string;
content: string;
created_at: string;
updated_at: string;
likes_count: number;
}

interface Post {
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
isLiked: boolean;
user: {
id: string;
email: string;
name: string;
college: string;
course: string;
location: string;
profileImage: string;
socialLinks: {
leetcode: string;
github: string;
linkedin: string;
instagram: string;
};
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

// Update the navigation type
type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const HomeScreen = () => {
const auth = FIREBASE_AUTH;
const navigation = useNavigation<HomeScreenNavigationProp>();
const route = useRoute<HomeScreenRouteProp>();
const [modalVisible, setModalVisible] = useState(false);
const [posts, setPosts] = useState<Post[]>([]);
const [loading, setLoading] = useState(true);
const [refreshing, setRefreshing] = useState(false);
const [selectedCategory, setSelectedCategory] = useState('Home');
const [currentUser, setCurrentUser] = useState<any>(null);

// Calculate paddingTop for Android dynamically
const androidStatusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;

// Get current user on component mount
useEffect(() => {
const getCurrentUser = async () => {
const { data: { user } } = await supabase.auth.getUser();
setCurrentUser(user);
};
getCurrentUser();
}, []);

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

// Memoize the post type mapping
const postTypeMap = useCallback((category: string): PostType => {
const map: { [key: string]: PostType } = {
'Home': 'normal',
'Opportunities': 'opportunity',
'Events': 'event',
'Competitions': 'competition',
'Achievements': 'achievement',
'Hackathons': 'hackathon'
};
return map[category] || 'normal';
}, []);

// Optimize fetchPosts with useCallback
const fetchPosts = useCallback(async (postType: PostType) => {
try {
setLoading(true);

// Construct the URL based on the selected category
  let url = SUPABASE_URL;
  if (selectedCategory !== 'Home') {
    url += `?type=eq.${postType}`;
  } else {
    url += `?type=eq.normal`;
  }

  // Fetch posts and user data in parallel
  const [postsResponse] = await Promise.all([
    fetch(url, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
    })
  ]);

  if (!postsResponse.ok) {
    throw new Error(`HTTP error! status: ${postsResponse.status}`);
  }

  const rawPosts = await postsResponse.json() as RawPost[];
  
  if (!rawPosts || rawPosts.length === 0) {
    setPosts([]);
    return;
  }

  // Fetch user data and likes in parallel
  const userIds = rawPosts.map(post => post.user_id);
  const uniqueUserIds = [...new Set(userIds)];
  
  const [usersResponse, { data: likes }] = await Promise.all([
    fetch(`${SUPABASE_URL.replace('/posts', '/Users')}?id=in.(${uniqueUserIds.join(',')})`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
    }),
    supabase
      .from('likes')
      .select('*')
      .in('post_id', rawPosts.map(post => post.id))
  ]);

  if (!usersResponse.ok) {
    throw new Error('Failed to fetch user data');
  }

  const users = await usersResponse.json() as RawUser[];
  const userMap = new Map(users.map(user => [user.id, user]));

  // Create likes map
  const likesMap = new Map<string, Like[]>();
  likes?.forEach((like: Like) => {
    if (!likesMap.has(like.post_id)) {
      likesMap.set(like.post_id, []);
    }
    likesMap.get(like.post_id)?.push(like);
  });

  // Transform posts with optimized mapping
  const transformedPosts = rawPosts.map((post: RawPost) => {
    const userData = userMap.get(post.user_id);
    const postLikes = likesMap.get(post.id) || [];
    const isLiked = currentUser ? postLikes.some(like => like.user_id === currentUser.id) : false;

    return {
      ...post,
      user: {
        id: userData?.id || '',
        email: userData?.email_id || '',
        name: userData?.name || '',
        college: userData?.college_name || '',
        course: userData?.course_name || '',
        location: userData?.location || '',
        profileImage: userData?.profile_image && userData.profile_image.length > 0 ? 
          `data:image/jpeg;base64,${Buffer.from(userData.profile_image).toString('base64')}` : 
          'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y',
        socialLinks: {
          leetcode: userData?.leetcode_link || '',
          github: userData?.github_link || '',
          linkedin: userData?.linkedin_link || '',
          instagram: userData?.instagram_link || ''
        }
      },
      type: post.type as PostType,
      images: post.images || [],
      likes_count: postLikes.length,
      comments_count: post.comments_count || 0,
      shares_count: post.shares_count || 0,
      requirements: post.requirements || [],
      rules: post.rules || [],
      technologies: post.technologies || [],
      likes: postLikes,
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
      end_date: post.end_date || null,
      isLiked,
    } as Post;
  });

  setPosts(transformedPosts);
} catch (error) {
  console.error('Error in fetchPosts:', error);
  if (error instanceof Error) {
    Alert.alert('Error', 'Failed to fetch posts: ' + error.message);
  }
} finally {
  setLoading(false);
  setRefreshing(false);
}


}, [selectedCategory, currentUser]);

// Optimize category change handler
const handleCategoryPress = useCallback((category: string) => {
setSelectedCategory(category);
const postType = postTypeMap(category);
fetchPosts(postType);
}, [postTypeMap, fetchPosts]);

// Update useEffect to use memoized functions
useEffect(() => {
const postType = postTypeMap(selectedCategory);
fetchPosts(postType);
}, [selectedCategory, postTypeMap, fetchPosts]);

// Optimize refresh handler
const handleRefresh = useCallback(() => {
setRefreshing(true);
const postType = postTypeMap(selectedCategory);
fetchPosts(postType);
}, [selectedCategory, postTypeMap, fetchPosts]);

const handleLike = async (postId: string) => {
try {
const { data: { user } } = await supabase.auth.getUser();
if (!user) throw new Error('User not authenticated');

// Check if the post is already liked
  const { data: existingLike } = await supabase
    .from('likes')
    .select()
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .single();

  if (existingLike) {
    // Unlike the post
    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', user.id);

    if (error) throw error;
  } else {
    // Like the post
    const { error } = await supabase
      .from('likes')
      .insert([{ post_id: postId, user_id: user.id }]);

    if (error) throw error;
  }

  // Refresh posts to update like count
  fetchPosts('normal');
} catch (error) {
  console.error('Error toggling like:', error);
  Alert.alert('Error', 'Failed to update like');
}


};

const handleComment = async (postId: string, content: string) => {
try {
const { data: { user } } = await supabase.auth.getUser();
if (!user) throw new Error('User not authenticated');

const { error } = await supabase
    .from('comments')
    .insert([{
      post_id: postId,
      user_id: user.id,
      content: content.trim(),
    }]);

  if (error) throw error;

  // Refresh posts to update comment count
  fetchPosts('normal');
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
studentId: userId
});
};

const renderPost = ({ item: post }: { item: Post }) => {
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
              {post.requirements.map((req: string, index: number) => (
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
              {post.rules.map((rule: string, index: number) => (
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
              {post.technologies.map((tech: string, index: number) => (
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
        {post.images.map((image: string, index: number) => (
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
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleLike(post.id)}
        >
          <Icon
            name={post.isLiked ? 'heart' : 'heart-outline'}
            size={24}
            color={post.isLiked ? '#ff3040' : '#000'}
          />
          <TouchableOpacity 
            onPress={() => {
              (navigation as any).navigate('Likes', { postId: post.id });
            }}
          >
            <Text style={[styles.actionCount, post.isLiked && styles.likedCount]}>
              {post.likes_count || 0}
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => {
            (navigation as any).navigate('Comments', { postId: post.id });
          }}
        >
          <Icon name="chatbubble-outline" size={24} color="#000" />
          <Text style={styles.actionCount}>{post.comments_count || 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleShare(post.id)}
        >
          <Icon name="share-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>
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
            { type: 'normal' as PostType, icon: 'document-text-outline', label: 'Normal Post' },
            { type: 'opportunity' as PostType, icon: 'briefcase-outline', label: 'Opportunity' },
            { type: 'event' as PostType, icon: 'calendar-outline', label: 'Event' },
            { type: 'competition' as PostType, icon: 'trophy-outline', label: 'Competition' },
            { type: 'achievement' as PostType, icon: 'ribbon-outline', label: 'Achievement' },
            { type: 'hackathon' as PostType, icon: 'code-working-outline', label: 'Hackathon' },
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
backgroundColor: '#fff',
marginBottom: 1,
borderBottomWidth: 1,
borderBottomColor: '#e0e0e0',
},
postHeader: {
flexDirection: 'row',
alignItems: 'center',
padding: 15,
backgroundColor: '#fff',
},
avatar: {
width: 45,
height: 45,
borderRadius: 22.5,
borderWidth: 2,
borderColor: '#0095f6',
},
postHeaderInfo: {
marginLeft: 15,
},
username: {
fontWeight: '700',
fontSize: 16,
color: '#000',
},
userInfo: {
color: '#666',
fontSize: 14,
fontWeight: '500',
},
postContent: {
padding: 15,
backgroundColor: '#fff',
},
postTitle: {
fontSize: 18,
fontWeight: '700',
color: '#000',
marginBottom: 10,
},
postDescription: {
fontSize: 15,
color: '#333',
lineHeight: 22,
fontWeight: '500',
},
postDetails: {
backgroundColor: '#f8f9fa',
padding: 15,
marginTop: 15,
borderRadius: 0,
borderLeftWidth: 4,
borderLeftColor: '#0095f6',
},
detailText: {
fontSize: 15,
color: '#333',
marginBottom: 8,
fontWeight: '500',
},
requirementText: {
fontSize: 15,
color: '#333',
marginLeft: 10,
marginBottom: 6,
fontWeight: '500',
},
imageScrollView: {
height: width,
},
postImage: {
width: width,
height: width,
},
postActions: {
padding: 15,
backgroundColor: '#fff',
borderTopWidth: 1,
borderTopColor: '#e0e0e0',
},
actionButtons: {
flexDirection: 'row',
alignItems: 'center',
},
actionButton: {
flexDirection: 'row',
alignItems: 'center',
marginRight: 25,
},
actionCount: {
marginLeft: 8,
fontSize: 15,
color: '#333',
fontWeight: '600',
},
likedCount: {
color: '#ff3040',
fontWeight: '700',
},
linkButton: {
backgroundColor: '#0095f6',
padding: 15,
marginTop: 15,
alignItems: 'center',
borderRadius: 0,
},
linkButtonText: {
color: '#FFFFFF',
fontWeight: '700',
fontSize: 16,
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


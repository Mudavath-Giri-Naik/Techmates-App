import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
  Dimensions,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { supabase } from '../../utils/supabase';
import { RootStackNavigatorProp } from '../types';

type StudentProfileParams = {
  studentId: string;
};

type StudentProfileRouteProp = RouteProp<{ StudentProfile: StudentProfileParams }, 'StudentProfile'>;

interface User {
  id: string;
  email_id: string;
  name: string;
  college_name: string;
  course_name: string;
  start_date: string;
  end_date: string;
  location: string;
  leetcode_link: string;
  github_link: string;
  linkedin_link: string;
  instagram_link: string;
  profile_image?: string;
}

const StudentProfile = () => {
  const navigation = useNavigation<RootStackNavigatorProp>();
  const route = useRoute<StudentProfileRouteProp>();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  useEffect(() => {
    fetchStudentProfile();
  }, []);

  const fetchStudentProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('Users')
        .select('*')
        .eq('id', route.params.studentId)
        .single();

      if (error) throw error;

      if (data) {
        setUser(data);
        calculateCurrentYear(data.start_date, data.end_date);
      }
    } catch (error) {
      console.error('Error fetching student profile:', error);
      Alert.alert('Error', 'Failed to load student profile');
    } finally {
      setLoading(false);
    }
  };

  const calculateCurrentYear = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    const totalYears = (end.getFullYear() - start.getFullYear());
    const yearsPassed = (now.getFullYear() - start.getFullYear());
    
    if (yearsPassed < 0) setCurrentYear(1);
    else if (yearsPassed >= totalYears) setCurrentYear(totalYears);
    else setCurrentYear(yearsPassed + 1);
  };

  const handleSocialLinkPress = async (url: string) => {
    if (!url) {
      return;
    }

    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    }
  };

  const getInitials = (name: string, email: string) => {
    if (name && name !== 'Anonymous User') {
      return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  const getAvatarUrl = (user: User) => {
    if (user.profile_image) {
      return user.profile_image;
    }
    
    const initials = getInitials(user.name, user.email_id);
    const colors = ['#4A90E2', '#50C878', '#FF6B6B', '#9B59B6', '#F1C40F', '#E67E22'];
    const colorIndex = user.email_id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    const backgroundColor = colors[colorIndex];
    
    return `https://ui-avatars.com/api/?name=${initials}&background=${backgroundColor.slice(1)}&color=fff&size=200&bold=true&format=svg`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-circle-outline" size={48} color="#666" />
        <Text style={styles.errorText}>Student profile not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Student Profile</Text>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: getAvatarUrl(user) }}
              style={styles.profileImage}
            />
            <View style={styles.avatarBadge}>
              <Icon name="checkmark-circle" size={20} color="#4A90E2" />
            </View>
          </View>
          
          <View style={styles.profileInfo}>
            <View style={styles.nameYearContainer}>
              <Text style={styles.profileName}>{user.name || 'Anonymous User'}</Text>
              {currentYear && (
                <View style={styles.yearBadge}>
                  <Text style={styles.yearText}>Year {currentYear}</Text>
                </View>
              )}
            </View>
            
            <View style={styles.detailsContainer}>
              <View style={styles.detailItem}>
                <Icon name="mail-outline" size={20} color="#4A90E2" />
                <Text style={styles.detailText}>{user.email_id}</Text>
              </View>
              
              {user.college_name && (
                <View style={styles.detailItem}>
                  <Icon name="school-outline" size={20} color="#4A90E2" />
                  <Text style={styles.detailText}>{user.college_name}</Text>
                </View>
              )}
              
              {user.course_name && (
                <View style={styles.detailItem}>
                  <Icon name="book-outline" size={20} color="#4A90E2" />
                  <Text style={styles.detailText}>{user.course_name}</Text>
                </View>
              )}
              
              {user.start_date && user.end_date && (
                <View style={styles.detailItem}>
                  <Icon name="calendar-outline" size={20} color="#4A90E2" />
                  <Text style={styles.detailText}>
                    {new Date(user.start_date).getFullYear()} - {new Date(user.end_date).getFullYear()}
                  </Text>
                </View>
              )}
              
              {user.location && (
                <View style={styles.detailItem}>
                  <Icon name="location-outline" size={20} color="#4A90E2" />
                  <Text style={styles.detailText}>{user.location}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={styles.socialLinksContainer}>
          <TouchableOpacity
            style={[styles.socialIcon, { backgroundColor: '#0078D7' }]}
            onPress={() => Linking.openURL(`mailto:${user.email_id}`)}
          >
            <Icon name="mail" size={24} color="#FFF" />
          </TouchableOpacity>

          {user.leetcode_link && (
            <TouchableOpacity
              style={[styles.socialIcon, { backgroundColor: '#FFA116' }]}
              onPress={() => handleSocialLinkPress(user.leetcode_link)}
            >
              <Icon name="code-working" size={24} color="#FFF" />
            </TouchableOpacity>
          )}

          {user.github_link && (
            <TouchableOpacity
              style={[styles.socialIcon, { backgroundColor: '#333' }]}
              onPress={() => handleSocialLinkPress(user.github_link)}
            >
              <Icon name="logo-github" size={24} color="#FFF" />
            </TouchableOpacity>
          )}

          {user.linkedin_link && (
            <TouchableOpacity
              style={[styles.socialIcon, { backgroundColor: '#0077B5' }]}
              onPress={() => handleSocialLinkPress(user.linkedin_link)}
            >
              <Icon name="logo-linkedin" size={24} color="#FFF" />
            </TouchableOpacity>
          )}

          {user.instagram_link && (
            <TouchableOpacity
              style={[styles.socialIcon, { backgroundColor: '#E4405F' }]}
              onPress={() => handleSocialLinkPress(user.instagram_link)}
            >
              <Icon name="logo-instagram" size={24} color="#FFF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <TouchableOpacity style={styles.messageButton}>
        <Icon name="chatbubble-outline" size={20} color="#FFF" />
        <Text style={styles.messageButtonText}>Send Message</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  profileCard: {
    backgroundColor: '#FFF',
    margin: 16,
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  profileHeader: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#4A90E2',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 2,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  profileInfo: {
    flex: 1,
  },
  nameYearContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A202C',
    marginRight: 12,
  },
  yearBadge: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  yearText: {
    color: '#FFF',
    fontWeight: '600',
  },
  detailsContainer: {
    marginTop: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#4A5568',
    marginLeft: 8,
  },
  socialLinksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  socialIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  messageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A90E2',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  messageButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default StudentProfile; 
// app/screens/ProfileScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  Image,
  Linking,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../utils/supabase';
import { RootStackNavigatorProp } from '../types';

interface ProfileData {
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

const ProfileScreen = () => {
  const navigation = useNavigation<RootStackNavigatorProp>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [currentYear, setCurrentYear] = useState<number | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [profileData, setProfileData] = useState<ProfileData>({
    id: '',
    email_id: '',
    name: '',
    college_name: '',
    course_name: '',
    start_date: '',
    end_date: '',
    location: '',
    leetcode_link: '',
    github_link: '',
    linkedin_link: '',
    instagram_link: '',
    profile_image: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigation.replace('Login');
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  const fetchProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      setIsAuthenticated(true);
      const { data, error } = await supabase
        .from('Users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) throw error;

      if (data) {
        setProfileData(data);
        calculateCurrentYear(data.start_date, data.end_date);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
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

  const handleSave = async () => {
    // Validate required fields
    const requiredFields = [
      'name', 'college_name', 'course_name', 'start_date', 
      'end_date', 'location', 'leetcode_link', 'github_link', 
      'linkedin_link', 'instagram_link'
    ];

    const missingFields = requiredFields.filter(field => !profileData[field as keyof ProfileData]);
    if (missingFields.length > 0) {
      Alert.alert('Error', `Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('Users')
        .update(profileData)
        .eq('id', profileData.id);

      if (error) throw error;

      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleDateChange = (
    event: DateTimePickerEvent,
    selectedDate: Date | undefined,
    type: 'start' | 'end'
  ) => {
    if (Platform.OS === 'android') {
      setShowStartDatePicker(false);
      setShowEndDatePicker(false);
    }

    if (selectedDate) {
      const dateString = selectedDate.toISOString().split('T')[0];
      setProfileData(prev => ({
        ...prev,
        [type === 'start' ? 'start_date' : 'end_date']: dateString
      }));
      calculateCurrentYear(
        type === 'start' ? dateString : profileData.start_date,
        type === 'end' ? dateString : profileData.end_date
      );
    }
  };

  const handleSocialLinkPress = async (url: string) => {
    if (!url) {
      Alert.alert('Error', 'No URL provided');
      return;
    }

    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Error', `Cannot open URL: ${url}`);
    }
  };

  const handleImagePick = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Permission to access camera roll is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        await uploadImage(asset.uri, asset.base64);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const uploadImage = async (uri: string, base64: string | null | undefined) => {
    try {
      setUploadingImage(true);

      // Convert base64 to blob
      let blob;
      if (base64) {
        const byteCharacters = atob(base64);
        const byteArrays = [];
        for (let offset = 0; offset < byteCharacters.length; offset += 512) {
          const slice = byteCharacters.slice(offset, offset + 512);
          const byteNumbers = new Array(slice.length);
          for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          byteArrays.push(byteArray);
        }
        blob = new Blob(byteArrays, { type: 'image/jpeg' });
      } else {
        // Fallback to fetch if base64 is not available
        const response = await fetch(uri);
        blob = await response.blob();
      }

      // Generate unique filename
      const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${profileData.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(filePath, blob, {
          contentType: `image/${fileExt}`,
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error('Failed to upload image to storage');
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath);

      if (!publicUrl) {
        throw new Error('Failed to get public URL for uploaded image');
      }

      // Update user profile
      const { error: updateError } = await supabase
        .from('Users')
        .update({ profile_image: publicUrl })
        .eq('id', profileData.id);

      if (updateError) {
        console.error('Profile update error:', updateError);
        throw new Error('Failed to update profile with new image');
      }

      setProfileData(prev => ({ ...prev, profile_image: publicUrl }));
      Alert.alert('Success', 'Profile image updated successfully');
    } catch (error) {
      console.error('Error in uploadImage:', error);
      Alert.alert(
        'Error',
        'Failed to upload image. Please check your internet connection and try again.'
      );
    } finally {
      setUploadingImage(false);
    }
  };

  const renderProfileView = () => (
    <ScrollView style={styles.container}>
      <View style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <TouchableOpacity onPress={handleImagePick} disabled={uploadingImage}>
            <View style={styles.imageContainer}>
              {profileData.profile_image ? (
                <Image
                  source={{ uri: profileData.profile_image }}
                  style={styles.profileImage}
                />
              ) : (
                <Image
                  source={{ uri: `https://avatar.iran.liara.run/username?username=${profileData.email_id}` }}
                  style={styles.profileImage}
                />
              )}
              {uploadingImage ? (
                <View style={styles.uploadingOverlay}>
                  <ActivityIndicator color="#FFF" />
                </View>
              ) : (
                <View style={styles.editImageOverlay}>
                  <Icon name="camera" size={24} color="#FFF" />
                </View>
              )}
            </View>
          </TouchableOpacity>
          
          <View style={styles.profileInfo}>
            <View style={styles.nameYearContainer}>
              <Text style={styles.profileName}>{profileData.name}</Text>
              {currentYear && (
                <View style={styles.yearBadge}>
                  <Text style={styles.yearText}>Year {currentYear}</Text>
                </View>
              )}
            </View>
            
            <View style={styles.detailsContainer}>
              <View style={styles.detailItem}>
                <Icon name="school-outline" size={20} color="#4A90E2" />
                <Text style={styles.detailText}>{profileData.college_name}</Text>
              </View>
              
              <View style={styles.detailItem}>
                <Icon name="book-outline" size={20} color="#4A90E2" />
                <Text style={styles.detailText}>{profileData.course_name}</Text>
              </View>
              
              <View style={styles.detailItem}>
                <Icon name="calendar-outline" size={20} color="#4A90E2" />
                <Text style={styles.detailText}>
                  {new Date(profileData.start_date).getFullYear()} - {new Date(profileData.end_date).getFullYear()}
                </Text>
              </View>
              
              <View style={styles.detailItem}>
                <Icon name="location-outline" size={20} color="#4A90E2" />
                <Text style={styles.detailText}>{profileData.location}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.socialLinksContainer}>
          <TouchableOpacity
            style={[styles.socialIcon, { backgroundColor: '#0078D7' }]}
            onPress={() => Linking.openURL(`mailto:${profileData.email_id}`)}
          >
            <Icon name="mail" size={24} color="#FFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.socialIcon, { backgroundColor: '#FFA116' }]}
            onPress={() => handleSocialLinkPress(profileData.leetcode_link)}
          >
            <Icon name="code-working" size={24} color="#FFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.socialIcon, { backgroundColor: '#333' }]}
            onPress={() => handleSocialLinkPress(profileData.github_link)}
          >
            <Icon name="logo-github" size={24} color="#FFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.socialIcon, { backgroundColor: '#0077B5' }]}
            onPress={() => handleSocialLinkPress(profileData.linkedin_link)}
          >
            <Icon name="logo-linkedin" size={24} color="#FFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.socialIcon, { backgroundColor: '#E4405F' }]}
            onPress={() => handleSocialLinkPress(profileData.instagram_link)}
          >
            <Icon name="logo-instagram" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={styles.editButton}
        onPress={() => setIsEditing(true)}
      >
        <Icon name="create-outline" size={20} color="#4A90E2" />
        <Text style={styles.editButtonText}>Edit Profile</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.loginPromptContainer}>
          <Icon name="person-circle-outline" size={80} color="#4A90E2" />
          <Text style={styles.loginPromptTitle}>Login Required</Text>
          <Text style={styles.loginPromptText}>
            Please login to view and manage your profile
        </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.replace('Login')}
          >
            <Text style={styles.loginButtonText}>Login to Continue</Text>
        </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isEditing ? (
        <ScrollView style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setIsEditing(false)}
            >
              <Icon name="arrow-back" size={24} color="#1A202C" />
            </TouchableOpacity>
            <Text style={styles.title}>Edit Profile</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Name *</Text>
              <TextInput
                style={styles.input}
                value={profileData.name}
                onChangeText={(text) => setProfileData(prev => ({ ...prev, name: text }))}
                placeholder="Enter your name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>College *</Text>
              <TextInput
                style={styles.input}
                value={profileData.college_name}
                onChangeText={(text) => setProfileData(prev => ({ ...prev, college_name: text }))}
                placeholder="Enter your college name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Course *</Text>
              <TextInput
                style={styles.input}
                value={profileData.course_name}
                onChangeText={(text) => setProfileData(prev => ({ ...prev, course_name: text }))}
                placeholder="Enter your course"
              />
          </View>

            <View style={styles.dateGroup}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Start Date *</Text>
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => setShowStartDatePicker(true)}
                >
                  <Text>{profileData.start_date || 'Select start date'}</Text>
                </TouchableOpacity>
                {showStartDatePicker && (
                  <DateTimePicker
                    value={profileData.start_date ? new Date(profileData.start_date) : new Date()}
                    mode="date"
                    onChange={(event, date) => handleDateChange(event, date, 'start')}
                  />
                )}
          </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>End Date *</Text>
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => setShowEndDatePicker(true)}
                >
                  <Text>{profileData.end_date || 'Select end date'}</Text>
                </TouchableOpacity>
                {showEndDatePicker && (
                  <DateTimePicker
                    value={profileData.end_date ? new Date(profileData.end_date) : new Date()}
                    mode="date"
                    onChange={(event, date) => handleDateChange(event, date, 'end')}
                  />
                )}
        </View>
      </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Location *</Text>
              <TextInput
                style={styles.input}
                value={profileData.location}
                onChangeText={(text) => setProfileData(prev => ({ ...prev, location: text }))}
                placeholder="Enter your location"
              />
      </View>

            <View style={styles.socialLinks}>
              <Text style={styles.sectionTitle}>Social Links</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>LeetCode *</Text>
                <TextInput
                  style={styles.input}
                  value={profileData.leetcode_link}
                  onChangeText={(text) => setProfileData(prev => ({ ...prev, leetcode_link: text }))}
                  placeholder="Enter your LeetCode profile URL"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>GitHub *</Text>
                <TextInput
                  style={styles.input}
                  value={profileData.github_link}
                  onChangeText={(text) => setProfileData(prev => ({ ...prev, github_link: text }))}
                  placeholder="Enter your GitHub profile URL"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>LinkedIn *</Text>
                <TextInput
                  style={styles.input}
                  value={profileData.linkedin_link}
                  onChangeText={(text) => setProfileData(prev => ({ ...prev, linkedin_link: text }))}
                  placeholder="Enter your LinkedIn profile URL"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Instagram *</Text>
                <TextInput
                  style={styles.input}
                  value={profileData.instagram_link}
                  onChangeText={(text) => setProfileData(prev => ({ ...prev, instagram_link: text }))}
                  placeholder="Enter your Instagram profile URL"
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={async () => {
                await handleSave();
                setIsEditing(false);
              }}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.saveButtonText}>Save Profile</Text>
              )}
      </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        <ScrollView style={styles.container}>
          {renderProfileView()}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Icon name="log-out-outline" size={20} color="#E53E3E" />
            <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A202C',
  },
  backButton: {
    padding: 8,
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A5568',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F6FA',
    borderWidth: 0,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1A202C',
  },
  dateGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  dateInput: {
    backgroundColor: '#F5F6FA',
    borderWidth: 0,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1A202C',
  },
  socialLinks: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A202C',
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: '#4A90E2',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    elevation: 0,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  profileCard: {
    backgroundColor: '#F5F6FA',
    margin: 16,
    borderRadius: 16,
    padding: 20,
    elevation: 0,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    borderWidth: 0,
  },
  profileHeader: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  imageContainer: {
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
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editImageOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4A90E2',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
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
    elevation: 0,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    backgroundColor: '#F5F6FA',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F6FA',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    elevation: 0,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  editButtonText: {
    color: '#4A90E2',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
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
  loginPromptContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loginPromptTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A202C',
    marginTop: 20,
    marginBottom: 10,
  },
  loginPromptText: {
    fontSize: 16,
    color: '#4A5568',
    textAlign: 'center',
    marginBottom: 30,
  },
  loginButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F6FA',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    elevation: 0,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  logoutButtonText: {
    color: '#E53E3E',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default ProfileScreen;
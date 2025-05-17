// app/screens/CreatePostScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackNavigatorProp, RootStackParamList } from '../types';
import Icon from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '../../utils/supabase';
import { PostType } from '../types/post';

type CreatePostRouteProp = RouteProp<RootStackParamList, 'CreatePost'>;

const CreatePostScreen = () => {
  const navigation = useNavigation<RootStackNavigatorProp>();
  const route = useRoute<CreatePostRouteProp>();
  const { postType } = route.params;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  // Additional fields based on post type
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [requirements, setRequirements] = useState('');
  const [location, setLocation] = useState('');
  const [salary, setSalary] = useState('');
  const [applicationLink, setApplicationLink] = useState('');
  const [venue, setVenue] = useState('');
  const [organizer, setOrganizer] = useState('');
  const [registrationLink, setRegistrationLink] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('');
  const [prize, setPrize] = useState('');
  const [rules, setRules] = useState('');
  const [theme, setTheme] = useState('');
  const [technologies, setTechnologies] = useState('');
  const [category, setCategory] = useState('');
  const [achievementDate, setAchievementDate] = useState(new Date());
  const [achievementLink, setAchievementLink] = useState('');

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant permission to access your photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const uploadImages = async () => {
    const uploadedUrls: string[] = [];
    
    for (const imageUri of images) {
      try {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
        const { data, error } = await supabase.storage
          .from('post-images')
          .upload(fileName, blob);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('post-images')
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
      } catch (error) {
        console.error('Error uploading image:', error);
        Alert.alert('Error', 'Failed to upload image');
      }
    }

    return uploadedUrls;
  };

  const handleSubmit = async () => {
    try {
      if (!title.trim() || !description.trim()) {
        Alert.alert('Error', 'Title and description are required');
        return;
      }

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const uploadedImageUrls = await uploadImages();
      
      const postData = {
        user_id: user.id,
        type: postType,
        title: title.trim(),
        description: description.trim(),
        images: uploadedImageUrls,
        ...(postType !== 'normal' && postType !== 'achievement' && {
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
        }),
        ...(postType === 'opportunity' && {
          company: company.trim(),
          role: role.trim(),
          requirements: requirements.split(',').map(r => r.trim()).filter(Boolean),
          location: location.trim(),
          salary: salary.trim() || null,
          application_link: applicationLink.trim() || null,
        }),
        ...(postType === 'event' && {
          venue: venue.trim(),
          organizer: organizer.trim(),
          registration_link: registrationLink.trim() || null,
          max_participants: maxParticipants ? parseInt(maxParticipants) : null,
        }),
        ...(postType === 'competition' && {
          prize: prize.trim(),
          rules: rules.split(',').map(r => r.trim()).filter(Boolean),
          registration_link: registrationLink.trim() || null,
          max_participants: maxParticipants ? parseInt(maxParticipants) : null,
        }),
        ...(postType === 'hackathon' && {
          theme: theme.trim(),
          prize: prize.trim(),
          registration_link: registrationLink.trim() || null,
          max_participants: maxParticipants ? parseInt(maxParticipants) : null,
          technologies: technologies.split(',').map(t => t.trim()).filter(Boolean),
        }),
        ...(postType === 'achievement' && {
          category: category.trim(),
          achievement_date: achievementDate.toISOString(),
          achievement_link: achievementLink.trim() || null,
        }),
      };

      const { error } = await supabase
        .from('posts')
        .insert([postData]);

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(error.message);
      }

      Alert.alert('Success', 'Post created successfully!');
      navigation.goBack();
    } catch (error: any) {
      console.error('Error creating post:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to create post. Please try again.'
      );
    }
  };

  const renderPostTypeSpecificFields = () => {
    switch (postType) {
      case 'opportunity':
        return (
          <>
            <TextInput
              style={styles.input}
              placeholder="Company"
              value={company}
              onChangeText={setCompany}
            />
            <TextInput
              style={styles.input}
              placeholder="Role"
              value={role}
              onChangeText={setRole}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Requirements (comma-separated)"
              value={requirements}
              onChangeText={setRequirements}
              multiline
            />
            <TextInput
              style={styles.input}
              placeholder="Location"
              value={location}
              onChangeText={setLocation}
            />
            <TextInput
              style={styles.input}
              placeholder="Salary (optional)"
              value={salary}
              onChangeText={setSalary}
            />
            <TextInput
              style={styles.input}
              placeholder="Application Link (optional)"
              value={applicationLink}
              onChangeText={setApplicationLink}
            />
          </>
        );
      case 'event':
        return (
          <>
            <TextInput
              style={styles.input}
              placeholder="Venue"
              value={venue}
              onChangeText={setVenue}
            />
            <TextInput
              style={styles.input}
              placeholder="Organizer"
              value={organizer}
              onChangeText={setOrganizer}
            />
            <TextInput
              style={styles.input}
              placeholder="Registration Link (optional)"
              value={registrationLink}
              onChangeText={setRegistrationLink}
            />
            <TextInput
              style={styles.input}
              placeholder="Max Participants (optional)"
              value={maxParticipants}
              onChangeText={setMaxParticipants}
              keyboardType="numeric"
            />
          </>
        );
      case 'competition':
        return (
          <>
            <TextInput
              style={styles.input}
              placeholder="Prize"
              value={prize}
              onChangeText={setPrize}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Rules (comma-separated)"
              value={rules}
              onChangeText={setRules}
              multiline
            />
            <TextInput
              style={styles.input}
              placeholder="Registration Link (optional)"
              value={registrationLink}
              onChangeText={setRegistrationLink}
            />
            <TextInput
              style={styles.input}
              placeholder="Max Participants (optional)"
              value={maxParticipants}
              onChangeText={setMaxParticipants}
              keyboardType="numeric"
            />
          </>
        );
      case 'hackathon':
        return (
          <>
            <TextInput
              style={styles.input}
              placeholder="Theme"
              value={theme}
              onChangeText={setTheme}
            />
            <TextInput
              style={styles.input}
              placeholder="Prize"
              value={prize}
              onChangeText={setPrize}
            />
            <TextInput
              style={styles.input}
              placeholder="Registration Link (optional)"
              value={registrationLink}
              onChangeText={setRegistrationLink}
            />
            <TextInput
              style={styles.input}
              placeholder="Max Participants (optional)"
              value={maxParticipants}
              onChangeText={setMaxParticipants}
              keyboardType="numeric"
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Technologies (comma-separated)"
              value={technologies}
              onChangeText={setTechnologies}
              multiline
            />
          </>
        );
      case 'achievement':
        return (
          <>
            <TextInput
              style={styles.input}
              placeholder="Category"
              value={category}
              onChangeText={setCategory}
            />
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowStartDatePicker(true)}
            >
              <Text>Date: {achievementDate.toLocaleDateString()}</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              placeholder="Link (optional)"
              value={achievementLink}
              onChangeText={setAchievementLink}
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      {postType !== 'normal' && postType !== 'achievement' && (
        <>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowStartDatePicker(true)}
          >
            <Text>Start Date: {startDate.toLocaleDateString()}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowEndDatePicker(true)}
          >
            <Text>End Date: {endDate.toLocaleDateString()}</Text>
          </TouchableOpacity>
        </>
      )}

      {renderPostTypeSpecificFields()}

      <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
        <Icon name="image-outline" size={24} color="#0095f6" />
        <Text style={styles.imageButtonText}>Add Images</Text>
      </TouchableOpacity>

      <View style={styles.imagePreviewContainer}>
        {images.map((uri, index) => (
          <Image key={index} source={{ uri }} style={styles.imagePreview} />
        ))}
    </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Create Post</Text>
      </TouchableOpacity>

      {(showStartDatePicker || showEndDatePicker) && (
        <DateTimePicker
          value={showStartDatePicker ? startDate : endDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            if (event.type === 'set' && selectedDate) {
              if (showStartDatePicker) {
                setStartDate(selectedDate);
                setShowStartDatePicker(false);
              } else {
                setEndDate(selectedDate);
                setShowEndDatePicker(false);
              }
            } else {
              setShowStartDatePicker(false);
              setShowEndDatePicker(false);
            }
          }}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  imageButtonText: {
    marginLeft: 8,
    color: '#0095f6',
    fontSize: 16,
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  imagePreview: {
    width: 100,
    height: 100,
    margin: 4,
    borderRadius: 8,
  },
  submitButton: {
    backgroundColor: '#0095f6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 32,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CreatePostScreen;
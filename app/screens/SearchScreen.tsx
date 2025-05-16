// app/screens/SearchScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { supabase } from '../../utils/supabase';
import { RootStackNavigatorProp } from '../types';

interface User {
  id: string;
  name: string;
  college_name: string;
  course_name: string;
  start_date: string;
  end_date: string;
  profile_image?: string;
  location: string;
}

interface College {
  name: string;
  location: string;
  userCount: number;
}

const SearchScreen = () => {
  const navigation = useNavigation<RootStackNavigatorProp>();
  const [users, setUsers] = useState<User[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [selectedCollege, setSelectedCollege] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
    
    // Subscribe to real-time changes
    const subscription = supabase
      .channel('users_changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'Users'
        },
        (payload) => {
          console.log('Real-time update received:', payload);
          handleRealtimeUpdate(payload);
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleRealtimeUpdate = (payload: any) => {
    if (payload.eventType === 'INSERT') {
      // New user added
      const newUser = payload.new;
      setUsers(prevUsers => {
        const updatedUsers = [...prevUsers, newUser];
        updateColleges(updatedUsers);
        return updatedUsers;
      });
    } else if (payload.eventType === 'UPDATE') {
      // User updated
      const updatedUser = payload.new;
      setUsers(prevUsers => {
        const updatedUsers = prevUsers.map(user => 
          user.id === updatedUser.id ? updatedUser : user
        );
        updateColleges(updatedUsers);
        return updatedUsers;
      });
    } else if (payload.eventType === 'DELETE') {
      // User deleted
      const deletedUserId = payload.old.id;
      setUsers(prevUsers => {
        const updatedUsers = prevUsers.filter(user => user.id !== deletedUserId);
        updateColleges(updatedUsers);
        return updatedUsers;
      });
    }
  };

  const updateColleges = (usersList: User[]) => {
    const collegeMap = new Map<string, College>();
    usersList.forEach(user => {
      if (user.college_name) {
        if (!collegeMap.has(user.college_name)) {
          collegeMap.set(user.college_name, {
            name: user.college_name,
            location: user.location || 'Location not specified',
            userCount: 1
          });
        } else {
          const college = collegeMap.get(user.college_name)!;
          college.userCount++;
        }
      }
    });
    setColleges(Array.from(collegeMap.values()));
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('Users')
        .select('id, name, college_name, course_name, start_date, end_date, profile_image, location');

      if (error) throw error;

      if (data) {
        setUsers(data);
        updateColleges(data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const calculateCurrentYear = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return null;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    const totalYears = (end.getFullYear() - start.getFullYear());
    const yearsPassed = (now.getFullYear() - start.getFullYear());
    
    if (yearsPassed < 0) return 1;
    if (yearsPassed >= totalYears) return totalYears;
    return yearsPassed + 1;
  };

  const filteredColleges = colleges.filter(college => 
    college.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    college.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = users.filter(user => 
    user.college_name === selectedCollege &&
    (user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.course_name?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const renderCollegeItem = ({ item }: { item: College }) => (
    <TouchableOpacity
      style={styles.collegeCard}
      onPress={() => setSelectedCollege(item.name)}
    >
      <View style={styles.userCountTagAbsolute}>
        <Text style={styles.userCountText}>{item.userCount} {item.userCount === 1 ? 'Student' : 'Students'}</Text>
      </View>
      <View style={styles.collegeCardRow}>
        <View style={styles.collegeIconContainer}>
          <Icon name="school" size={32} color="#4A90E2" />
        </View>
        <View style={styles.collegeCardContentLeft}>
          <Text style={styles.collegeNameLeft} numberOfLines={1}>{item.name}</Text>
          <View style={styles.collegeLocationLeft}>
            <Icon name="location" size={16} color="#4A5568" style={{ marginRight: 4 }} />
            <Text style={styles.locationTextLeft} numberOfLines={1}>{item.location}</Text>
          </View>
        </View>
      </View>
      <Icon name="chevron-forward" size={24} color="#CBD5E0" style={styles.chevronIconAbsolute} />
    </TouchableOpacity>
  );

  const renderUserItem = ({ item, index }: { item: User; index: number }) => {
    const currentYear = calculateCurrentYear(item.start_date, item.end_date);
    return (
      <View style={styles.studentCardWrapper}>
        <View style={styles.serialNumberBadgeSpecial}>
          <Text style={styles.serialNumberBadgeText}>{index + 1}</Text>
        </View>
        <TouchableOpacity
          style={styles.studentCard}
          onPress={() => navigation.navigate('StudentProfile', { studentId: item.id })}
        >
          <View style={styles.studentCardRow}>
            <View style={styles.avatarContainer}>
              {item.profile_image ? (
                <Image source={{ uri: item.profile_image }} style={styles.avatar} />
              ) : (
                <Icon name="person-circle" size={48} color="#CBD5E0" />
              )}
            </View>
            <View style={styles.studentInfo}>
              <Text style={styles.studentName}>{item.name}</Text>
              <Text style={styles.studentBranch}>{item.course_name}</Text>
              {currentYear && (
                <Text style={styles.studentYear}>Year {currentYear}</Text>
              )}
            </View>
            <Icon name="chevron-forward" size={24} color="#A0AEC0" style={styles.studentChevron} />
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#4A5568" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={selectedCollege ? "Search students..." : "Search colleges..."}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#A0AEC0"
        />
        {selectedCollege && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setSelectedCollege(null)}
          >
            <Icon name="arrow-back" size={20} color="#4A5568" />
          </TouchableOpacity>
        )}
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : selectedCollege ? (
        <>
          <Text style={styles.collegeStudentsTitleCentered}>
            {selectedCollege} Students ({filteredUsers.length})
          </Text>
          <FlatList<User>
            data={filteredUsers}
            renderItem={renderUserItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        </>
      ) : (
        <FlatList<College>
          data={filteredColleges}
          renderItem={renderCollegeItem}
          keyExtractor={(item) => item.name}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 35,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    margin: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#1A202C',
  },
  backButton: {
    padding: 8,
    marginLeft: 8,
  },
  listContainer: {
    padding: 16,
  },
  collegeHeader: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  collegeHeaderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A202C',
  },
  collegeCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    position: 'relative',
  },
  userCountTagAbsolute: {
    position: 'absolute',
    top: 10,
    right: 16,
    backgroundColor: '#EBF8FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 2,
  },
  collegeCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  collegeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EBF8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  collegeCardContentLeft: {
    flex: 1,
    justifyContent: 'center',
  },
  collegeNameLeft: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A202C',
    textAlign: 'left',
    marginBottom: 6,
  },
  collegeLocationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  locationTextLeft: {
    fontSize: 14,
    color: '#4A5568',
    textAlign: 'left',
  },
  chevronIconAbsolute: {
    position: 'absolute',
    bottom: 10,
    right: 16,
    zIndex: 2,
  },
  userCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serialNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  serialNumberText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#4A90E2',
  },
  defaultAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4A90E2',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A202C',
    marginBottom: 4,
  },
  courseName: {
    fontSize: 14,
    color: '#4A5568',
    marginBottom: 4,
  },
  yearBadge: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  yearText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    color: '#E53E3E',
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userCountText: {
    color: '#4A90E2',
    fontSize: 12,
    fontWeight: '600',
  },
  collegeStudentsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A202C',
    marginLeft: 24,
    marginTop: 12,
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  collegeStudentsTitleCentered: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A202C',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  studentCard: {
    backgroundColor: '#F5F6FA',
    borderRadius: 12,
    marginBottom: 14,
    padding: 16,
    position: 'relative',
    flexDirection: 'column',
    minHeight: 80,
  },
  studentCardWrapper: {
    position: 'relative',
    marginBottom: 18,
  },
  serialNumberBadgeSpecial: {
    position: 'absolute',
    top: -10,
    left: 18,
    backgroundColor: '#4A90E2',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 2,
    zIndex: 2,
    minWidth: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  serialNumberBadgeText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  studentCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 56,
  },
  studentInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A202C',
    marginBottom: 2,
  },
  studentBranch: {
    fontSize: 14,
    color: '#4A5568',
    marginBottom: 2,
  },
  studentYear: {
    fontSize: 13,
    color: '#4A90E2',
    fontWeight: '500',
  },
  studentChevron: {
    marginLeft: 12,
  },
});

export default SearchScreen;
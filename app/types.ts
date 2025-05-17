// app/types.ts
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import { PostType } from './types/post';

// For the main Stack Navigator (Auth flow + Main App Tabs)
export type RootStackParamList = {
  Login: undefined;
  MainApp: NavigatorScreenParams<TabParamList>; // MainApp will contain our TabNavigator
  CreatePost: { postType: PostType };
  Comments: { postId: string };
  Messenger: undefined;
  StudentProfile: { studentId: string };
  Profile: undefined;
  Settings: undefined;
};

// For the Bottom Tab Navigator
export type TabParamList = {
  HomeTab: undefined; // Renamed to avoid conflict with RootStack's Home
  SearchTab: undefined;
  CreatePost: { postType: PostType };
  NotificationsTab: undefined;
  ProfileTab: undefined;
};

// Props for screens in RootStack
export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

// Props for screens in TabNavigator, also allowing navigation to RootStack screens
export type TabScreenProps<T extends keyof TabParamList> = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, T>,
  NativeStackScreenProps<RootStackParamList> // Allows navigation.navigate('CreatePost') from a tab screen
>;

// Specific navigation prop for RootStack, usable with useNavigation
export type RootStackNavigatorProp = {
  navigate: (screen: keyof RootStackParamList, params?: any) => void;
  goBack: () => void;
};
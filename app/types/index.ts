import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RouteProp } from '@react-navigation/native';
import { PostType } from './post';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  MainTabs: undefined;
  CreatePost: { postType: PostType };
  Comments: { postId: string };
  Likes: { postId: string };
  StudentProfile: { studentId: string };
  Messenger: undefined;
  Chat: { userId: string; userName: string };
};

export interface HomeTabParams {
  selectedCategory?: string;
}

export type TabParamList = {
  HomeTab: { selectedCategory?: string };
  ProfileTab: undefined;
  CreatePostTab: undefined;
  MessengerTab: undefined;
};

export type RootStackNavigatorProp = NativeStackNavigationProp<RootStackParamList>;

export type HomeScreenRouteProp = RouteProp<TabParamList, 'HomeTab'>; 
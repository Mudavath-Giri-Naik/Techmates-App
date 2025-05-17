import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  MainApp: {
    screen?: string;
    params?: {
      selectedCategory?: string;
    };
  };
  CreatePost: { postType: string };
  Comments: { postId: string };
  StudentProfile: { userId: string; showBackButton?: boolean };
  Profile: undefined;
};

export interface HomeTabParams {
  selectedCategory?: string;
}

export type TabParamList = {
  HomeTab: HomeTabParams;
  SearchTab: undefined;
  ResourcesTab: undefined;
  ChatTab: undefined;
};

export type RootStackNavigatorProp = CompositeNavigationProp<
  NativeStackNavigationProp<RootStackParamList>,
  BottomTabNavigationProp<TabParamList>
>; 
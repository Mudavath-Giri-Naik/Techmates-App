export type PostType = 'normal' | 'opportunity' | 'event' | 'competition' | 'achievement' | 'hackathon';

export interface User {
  id: string;
  email_id: string;
  name: string;
  college_name: string;
  course_name: string;
  start_date?: string;
  end_date?: string;
  location?: string;
  leetcode_link?: string;
  github_link?: string;
  linkedin_link?: string;
  instagram_link?: string;
  profile_image?: string;
}

export interface Like {
  user_id: string;
}

export interface Comment {
  id: string;
  content: string;
  created_at: string;
  user: User;
}

export interface Post {
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
  // Opportunity specific fields
  company?: string;
  role?: string;
  salary?: string;
  application_link?: string;
  requirements?: string[];
  // Event specific fields
  venue?: string;
  organizer?: string;
  registration_link?: string;
  max_participants?: number;
  // Competition specific fields
  prize?: string;
  rules?: string[];
  // Hackathon specific fields
  theme?: string;
  technologies?: string[];
  // Achievement specific fields
  category?: string;
  achievement_date?: string;
  achievement_link?: string;
  // Common date fields
  start_date?: string;
  end_date?: string;
  location?: string;
}

export type PostWithUser = Post & {
  user: User;
};

export interface NormalPost extends Post {}

export interface OpportunityPost extends Post {
  type: 'opportunity';
  company: string;
  role: string;
  location: string;
  start_date: string;
  end_date: string;
  requirements: string[];
}

export interface EventPost extends Post {
  type: 'event';
  venue: string;
  organizer: string;
  start_date: string;
  end_date: string;
}

export interface CompetitionPost extends Post {
  type: 'competition';
  prize: string;
  start_date: string;
  end_date: string;
  rules: string[];
}

export interface HackathonPost extends Post {
  type: 'hackathon';
  theme: string;
  prize: string;
  start_date: string;
  end_date: string;
  rules: string[];
  technologies: string[];
}

export interface AchievementPost extends Post {
  type: 'achievement';
  category: string;
  achievement_date: string;
}

export type Post = NormalPost | OpportunityPost | EventPost | CompetitionPost | HackathonPost | AchievementPost; 
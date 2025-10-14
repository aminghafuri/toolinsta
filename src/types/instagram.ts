// Instagram data export types based on typical Instagram export structure
export interface InstagramUser {
  username: string;
  email?: string;
  phone?: string;
  profile_pic_url?: string;
  bio?: string;
  followers_count?: number;
  following_count?: number;
  media_count?: number;
}

export interface InstagramMedia {
  id: string;
  media_type: 'photo' | 'video' | 'carousel';
  media_url: string;
  thumbnail_url?: string;
  caption?: string;
  timestamp: string;
  likes_count?: number;
  comments_count?: number;
  location?: {
    name: string;
    latitude?: number;
    longitude?: number;
  };
  dimensions?: {
    height: number;
    width: number;
  };
}

export interface InstagramPostMedia {
  uri: string;
  creation_timestamp: number;
  media_metadata: {
    photo_metadata?: {
      exif_data?: Array<{
        latitude?: number;
        longitude?: number;
        device_id?: string;
        source_type?: string;
        scene_capture_type?: string;
        software?: string;
        camera_position?: string;
        date_time_digitized?: string;
        date_time_original?: string;
      }>;
    };
    video_metadata?: {
      exif_data?: Array<{
        device_id?: string;
        camera_position?: string;
        date_time_original?: string;
        source_type?: string;
      }>;
    };
    camera_metadata: {
      has_camera_metadata: boolean;
    };
  };
  title: string;
  cross_post_source: {
    source_app: string;
  };
}

export interface InstagramPost {
  media: InstagramPostMedia[];
  title: string;
  creation_timestamp: number;
}

export interface InstagramCarousel extends InstagramMedia {
  media_type: 'carousel';
  children: InstagramMedia[];
}

export interface InstagramStoryMedia {
  uri: string;
  creation_timestamp: number;
  media_metadata: {
    photo_metadata?: {
      exif_data?: Array<{
        device_id?: string;
        camera_position?: string;
        source_type?: string;
        scene_capture_type?: string;
        software?: string;
        date_time_digitized?: string;
        date_time_original?: string;
      }>;
    };
    video_metadata?: {
      exif_data?: Array<{
        device_id?: string;
        camera_position?: string;
        date_time_original?: string;
        source_type?: string;
      }>;
    };
    camera_metadata: {
      has_camera_metadata: boolean;
    };
  };
  title: string;
  cross_post_source: {
    source_app: string;
  };
  dubbing_info?: unknown[];
  media_variants?: unknown[];
}

export interface InstagramStory {
  ig_stories: InstagramStoryMedia[];
}

export interface InstagramComment {
  id: string;
  text: string;
  timestamp: string;
  author: {
    username: string;
    profile_pic_url?: string;
  };
  likes_count?: number;
  replies?: InstagramComment[];
}

export interface InstagramLike {
  username: string;
  timestamp: string;
}

export interface InstagramList {
  username: string;
  timestamp?: number;
  href?: string;
}

export interface ProfileChange {
  title: string;
  media_map_data: Record<string, unknown>;
  string_map_data: {
    Changed: {
      href: string;
      value: string;
      timestamp: number;
    };
    "Previous Value": {
      href: string;
      value: string;
      timestamp: number;
    };
    "New Value": {
      href: string;
      value: string;
      timestamp: number;
    };
    "Change Date": {
      href: string;
      value: string;
      timestamp: number;
    };
  };
}

export interface ProfileChangesData {
  profile_profile_change: ProfileChange[];
}

export interface RecommendedTopic {
  title: string;
  media_map_data: Record<string, unknown>;
  string_map_data: {
    Name: {
      href: string;
      value: string;
      timestamp: number;
    };
  };
}

export interface RecommendedTopicsData {
  topics_your_topics: RecommendedTopic[];
}

export interface InstagramExportData {
  user: InstagramUser;
  posts: InstagramPost[];
  carousels: InstagramCarousel[];
  stories: InstagramStory[];
  comments: InstagramComment[];
  likes: InstagramLike[];
  followers: string[];
  following: string[];
  settings: {
    privacy: Record<string, unknown>;
    notifications: Record<string, unknown>;
  };
}

export interface ExtractedFile {
  name: string;
  path: string;
  type: 'json' | 'image' | 'video' | 'other';
  content?: unknown;
  url?: string;
  size: number;
}


export interface ZipExtractionResult {
  files: ExtractedFile[];
  userData: InstagramUser | null;
  posts: InstagramPost[];
  carousels: InstagramCarousel[];
  stories: InstagramStory;
  followers: InstagramList[];
  following: InstagramList[];
  blockedProfiles: InstagramList[];
  pendingFollowRequests: InstagramList[];
  recentFollowRequests: InstagramList[];
  recentlyUnfollowed: InstagramList[];
  removedSuggestions: InstagramList[];
  unfollowers: InstagramList[];
  locationsOfInterest: string[];
  personalInfo: {
    email?: string;
    phoneNumber?: string;
    phoneConfirmed?: boolean;
    phoneConfirmationMethod?: string;
    username?: string;
    name?: string;
    bio?: string;
    gender?: string;
    dateOfBirth?: string;
    privateAccount?: boolean;
    profilePhotoUri?: string;
  };
  profileChanges: ProfileChange[];
  recommendedTopics: RecommendedTopic[];
  totalMediaCount: number;
  extractionDate: string;
  _isSummary?: boolean;
}

// Unified media interface for gallery display
export interface UnifiedMedia {
  type: 'post' | 'carousel' | 'story';
  id: string;
  timestamp: string;
  media_url: string;
  caption?: string;
  likes_count?: number;
  comments_count?: number;
  location?: {
    name: string;
    latitude?: number;
    longitude?: number;
  };
  dimensions?: {
    height: number;
    width: number;
  };
  // For posts
  media?: InstagramPostMedia[];
  title?: string;
  creation_timestamp?: number;
  // For carousels
  media_type?: 'carousel';
  children?: InstagramMedia[];
  // For stories
  ig_stories?: InstagramStoryMedia[];
}

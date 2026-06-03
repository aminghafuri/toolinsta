import JSZip from 'jszip';
import { ExtractedFile, ZipExtractionResult, InstagramUser, InstagramList, ProfileChange, RecommendedTopic, InstagramPost, InstagramStory } from '@/types/instagram';
import { findUnfollowers } from '@/lib/unfollowers';

// Enhanced utility function to determine file type based on extension
function getFileType(filename: string): 'json' | 'image' | 'video' | 'other' {
  const ext = filename.toLowerCase().split('.').pop();

  if (ext === 'json') return 'json';

  // Image formats (including more comprehensive list)
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff', 'tif', 'svg'].includes(ext || '')) {
    return 'image';
  }

  // Video formats (including more comprehensive list)
  if (['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv', 'wmv', 'm4v', '3gp', 'ogv'].includes(ext || '')) {
    return 'video';
  }

  // For files without extensions, try to infer from path
  if (filename.includes('media/stories/') || filename.includes('media/posts/')) {
    // If it's in a media folder but no extension, default to image
    return 'image';
  }

  return 'other';
}

// Parse Instagram JSON files to extract all relationship data
function parseInstagramData(files: ExtractedFile[]): {
  user: InstagramUser | null;
  followers: InstagramList[];
  following: InstagramList[];
  blockedProfiles: InstagramList[];
  pendingFollowRequests: InstagramList[];
  recentFollowRequests: InstagramList[];
  recentlyUnfollowed: InstagramList[];
  removedSuggestions: InstagramList[];
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
  posts: InstagramPost[];
  stories: InstagramStory;
} {
  let user: InstagramUser | null = null;
  const followers: InstagramList[] = [];
  const following: InstagramList[] = [];
  const blockedProfiles: InstagramList[] = [];
  const pendingFollowRequests: InstagramList[] = [];
  const recentFollowRequests: InstagramList[] = [];
  const recentlyUnfollowed: InstagramList[] = [];
  const removedSuggestions: InstagramList[] = [];
  const locationsOfInterest: string[] = [];
  const personalInfo: {
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
  } = {};
  const profileChanges: ProfileChange[] = [];
  const recommendedTopics: RecommendedTopic[] = [];
  const posts: InstagramPost[] = [];
  const stories: InstagramStory = { ig_stories: [] };

  // Find and parse user information from personal_information folder
  const userFiles = files.filter(f =>
    f.path.includes('personal_information/') &&
    (f.name === 'instagram_profile_information.json' || f.name === 'personal_information.json')
  );

  for (const userFile of userFiles) {
    if (userFile?.content) {
      try {
        const userData = userFile.content as Record<string, unknown>;
        user = {
          username: (userData.username as string) || (userData.account_username as string) || '',
          email: (userData.email as string) || (userData.contact_email as string),
          phone: (userData.phone_number as string) || (userData.contact_phone as string),
          profile_pic_url: userData.profile_pic_url as string | undefined,
          bio: (userData.bio as string) || (userData.biography as string),
          followers_count: 0,
          following_count: 0,
          media_count: 0,
        };
        break; // Use the first valid user data found
      } catch (error) {
        console.warn('Error parsing user data:', error);
      }
    }
  }

  // Parse followers data
  const followersFile = files.find(f => f.path.includes('connections/followers_and_following/followers_1.json'));

  if (followersFile?.content) {
    try {
      const followersData = followersFile.content as Record<string, unknown>[];
      if (Array.isArray(followersData)) {
        followersData.forEach((follower: unknown) => {
          const typedFollower = follower as Record<string, unknown>;
          const stringListData = typedFollower.string_list_data as Record<string, unknown>[];
          if (Array.isArray(stringListData)) {
            stringListData.forEach((item: unknown) => {
              const typedItem = item as Record<string, unknown>;
              const username = typedItem.value as string;
              if (username) {
                followers.push({
                  username,
                  timestamp: typedItem.timestamp as number,
                  href: typedItem.href as string
                });
              }
            });
          }
        });
      }
    } catch (error) {
      console.warn('Error parsing followers data:', error);
    }
  }


  // Parse following data
  const followingFile = files.find(f => f.path.includes('connections/followers_and_following/following.json'));

  if (followingFile?.content) {
    try {
      const followingData = followingFile.content as Record<string, unknown>;

      // Handle the relationships_following structure
      const relationshipsFollowing = followingData.relationships_following as Record<string, unknown>[];

      if (Array.isArray(relationshipsFollowing)) {
        relationshipsFollowing.forEach((followed: unknown) => {
          const typedFollowed = followed as Record<string, unknown>;
          const stringListData = typedFollowed.string_list_data as Record<string, unknown>[];

          if (Array.isArray(stringListData)) {
            // Handle new structure: username is in title field, no value field
            if (typedFollowed.title && typeof typedFollowed.title === 'string' && typedFollowed.title.trim() !== '') {
              // For new structure, we only need the first item from string_list_data
              const item = stringListData[0] as Record<string, unknown>;
              if (item) {
                following.push({
                  username: typedFollowed.title as string,
                  timestamp: item.timestamp as number,
                  href: item.href as string
                });
              }
            } else {
              // Handle old structure: username is in value field
              stringListData.forEach((item: unknown) => {
                const typedItem = item as Record<string, unknown>;
                const username = typedItem.value as string;
                if (username) {
                  following.push({
                    username,
                    timestamp: typedItem.timestamp as number,
                    href: typedItem.href as string
                  });
                }
              });
            }
          }
        });
      }
    } catch (error) {
      console.warn('Error parsing following data:', error);
    }
  }

  // Parse blocked profiles 
  const blockedFile = files.find(f => f.path.includes('connections/followers_and_following/blocked_profiles.json'));
  if (blockedFile?.content) {
    try {
      const blockedRaw = blockedFile.content as Record<string, unknown>[];
      if (!Array.isArray(blockedRaw)) {
        console.warn('Unexpected blocked_profiles.json format: expected a top-level array.');
      } else {
        blockedRaw.forEach((entry) => {
          const labelValues = entry.label_values as Array<{ label: string; value: string }> | undefined;
          if (!Array.isArray(labelValues)) return;

          const getValue = (label: string) =>
            labelValues.find((lv) => lv.label === label)?.value ?? '';

          const username = getValue('Username').trim();
          if (!username) return;

          const urlValue = getValue('URL');
          const href = urlValue || `https://www.instagram.com/_u/${username}`;

          blockedProfiles.push({
            username,
            timestamp: entry.timestamp as number,
            href,
          });
        });
      }
    } catch (error) {
      console.warn('Error parsing blocked profiles data:', error);
    }
  }

  // Parse pending follow requests 
  const pendingFile = files.find(f => f.path.includes('connections/followers_and_following/pending_follow_requests.json'));
  if (pendingFile?.content) {
    try {
      const pendingRaw = pendingFile.content as Record<string, unknown>[];
      if (!Array.isArray(pendingRaw)) {
        console.warn('Unexpected pending_follow_requests.json format: expected a top-level array.');
      } else {
        pendingRaw.forEach((entry) => {
          const labelValues = entry.label_values as Array<{ label: string; value: string }> | undefined;
          if (!Array.isArray(labelValues)) return;

          const getValue = (label: string) =>
            labelValues.find((lv) => lv.label === label)?.value ?? '';

          const username = getValue('Username').trim();
          if (!username) return;

          const urlValue = getValue('URL');
          const href = urlValue || `https://www.instagram.com/_u/${username}`;

          pendingFollowRequests.push({
            username,
            timestamp: entry.timestamp as number,
            href,
          });
        });
      }
    } catch (error) {
      console.warn('Error parsing pending follow requests data:', error);
    }
  }

  // Parse recent follow requests
  const recentFile = files.find(f => f.path.includes('connections/followers_and_following/recent_follow_requests.json'));
  if (recentFile?.content) {
    try {
      const recentRaw = recentFile.content as Record<string, unknown>[];
      if (!Array.isArray(recentRaw)) {
        console.warn('Unexpected recent_follow_requests.json format: expected a top-level array.');
      } else {
        recentRaw.forEach((entry) => {
          const labelValues = entry.label_values as Array<{ label: string; value: string }> | undefined;
          if (!Array.isArray(labelValues)) return;

          const getValue = (label: string) =>
            labelValues.find((lv) => lv.label === label)?.value ?? '';

          const username = getValue('Username').trim();
          if (!username) return;

          const urlValue = getValue('URL');
          const href = urlValue || `https://www.instagram.com/_u/${username}`;

          recentFollowRequests.push({
            username,
            timestamp: entry.timestamp as number,
            href,
          });
        });
      }
    } catch (error) {
      console.warn('Error parsing recent follow requests data:', error);
    }
  }

  // Parse recently unfollowed profiles
  const unfollowedFile = files.find(f => f.path.includes('connections/followers_and_following/recently_unfollowed_profiles.json'));
  if (unfollowedFile?.content) {
    try {
      const unfollowedRaw = unfollowedFile.content as Record<string, unknown>[];
      if (!Array.isArray(unfollowedRaw)) {
        console.warn('Unexpected recently_unfollowed_profiles.json format: expected a top-level array.');
      } else {
        unfollowedRaw.forEach((entry) => {
          const labelValues = entry.label_values as Array<{ label: string; value: string }> | undefined;
          if (!Array.isArray(labelValues)) return;

          const getValue = (label: string) =>
            labelValues.find((lv) => lv.label === label)?.value ?? '';

          const username = getValue('Username').trim();
          if (!username) return;

          const urlValue = getValue('URL');
          const href = urlValue || `https://www.instagram.com/_u/${username}`;

          recentlyUnfollowed.push({
            username,
            timestamp: entry.timestamp as number,
            href,
          });
        });
      }
    } catch (error) {
      console.warn('Error parsing recently unfollowed data:', error);
    }
  }

  // Parse removed suggestions
  const removedFile = files.find(f => f.path.includes('connections/followers_and_following/removed_suggestions.json'));
  if (removedFile?.content) {
    try {
      const removedRaw = removedFile.content as Record<string, unknown>[];
      if (!Array.isArray(removedRaw)) {
        console.warn('Unexpected removed_suggestions.json format: expected a top-level array.');
      } else {
        removedRaw.forEach((entry) => {
          const labelValues = entry.label_values as Array<{ label: string; value: string }> | undefined;
          if (!Array.isArray(labelValues)) return;

          const getValue = (label: string) =>
            labelValues.find((lv) => lv.label === label)?.value ?? '';

          const username = getValue('Username').trim();
          if (!username) return;

          const urlValue = getValue('URL');
          const href = urlValue || `https://www.instagram.com/_u/${username}`;

          removedSuggestions.push({
            username,
            timestamp: entry.timestamp as number,
            href,
          });
        });
      }
    } catch (error) {
      console.warn('Error parsing removed suggestions data:', error);
    }
  }

  // Parse locations of interest
  const locationsFile = files.find(f => f.path.includes('personal_information/information_about_you/locations_of_interest.json'));
  if (locationsFile?.content) {
    try {
      const locationsData = locationsFile.content as Record<string, unknown>;
      const labelValues = locationsData.label_values as Record<string, unknown>[];

      if (Array.isArray(labelValues)) {
        const locationsLabel = labelValues.find((item: unknown) => {
          const typedItem = item as Record<string, unknown>;
          return typedItem.label === 'Locations of interest';
        });

        if (locationsLabel) {
          const vec = locationsLabel.vec as Record<string, unknown>[];
          if (Array.isArray(vec)) {
            vec.forEach((location: unknown) => {
              const typedLocation = location as Record<string, unknown>;
              const value = typedLocation.value as string;
              if (value) {
                locationsOfInterest.push(value);
              }
            });
          }
        }
      }
    } catch (error) {
      console.warn('Error parsing locations of interest data:', error);
    }
  }

  // Parse personal information
  const personalInfoFile = files.find(f => f.path.includes('personal_information/personal_information/personal_information.json'));
  if (personalInfoFile?.content) {
    try {
      const personalData = personalInfoFile.content as Record<string, unknown>;
      const profileUser = personalData.profile_user as Record<string, unknown>[];

      if (Array.isArray(profileUser) && profileUser.length > 0) {
        const userData = profileUser[0];
        const stringMapData = userData.string_map_data as Record<string, unknown>;
        const mediaMapData = userData.media_map_data as Record<string, unknown>;

        if (stringMapData) {
          // Extract string data
          const getStringValue = (key: string): string | undefined => {
            const item = stringMapData[key] as { value?: string } | undefined;
            return item?.value;
          };

          personalInfo.email = getStringValue('Email');
          personalInfo.phoneNumber = getStringValue('Phone Number');
          personalInfo.phoneConfirmed = getStringValue('Phone Confirmed') === 'True';
          personalInfo.phoneConfirmationMethod = getStringValue('Phone Confirmation Method');
          personalInfo.username = getStringValue('Username');
          personalInfo.name = getStringValue('Name');
          personalInfo.bio = getStringValue('Bio');
          personalInfo.gender = getStringValue('Gender');
          personalInfo.dateOfBirth = getStringValue('Date of birth');
          personalInfo.privateAccount = getStringValue('Private Account') === 'True';
        }

        if (mediaMapData) {
          // Extract profile photo URI
          const profilePhoto = mediaMapData['Profile Photo'] as Record<string, unknown>;
          if (profilePhoto) {
            personalInfo.profilePhotoUri = profilePhoto.uri as string;
          }
        }
      }
    } catch (error) {
      console.warn('Error parsing personal information data:', error);
    }
  }

  // Parse profile changes
  const profileChangesFile = files.find(f => f.path.includes('personal_information/personal_information/profile_changes.json'));
  if (profileChangesFile?.content) {
    try {
      const profileChangesData = profileChangesFile.content as Record<string, unknown>;
      const profileProfileChange = profileChangesData.profile_profile_change as Record<string, unknown>[];

      if (Array.isArray(profileProfileChange)) {
        profileProfileChange.forEach((change: unknown) => {
          const typedChange = change as ProfileChange;
          if (typedChange && typedChange.string_map_data) {
            profileChanges.push(typedChange);
          }
        });
      }
    } catch (error) {
      console.warn('Error parsing profile changes data:', error);
    }
  }

  // Parse recommended topics
  const recommendedTopicsFile = files.find(f => f.path.includes('preferences/your_topics/recommended_topics.json'));
  if (recommendedTopicsFile?.content) {
    try {
      const recommendedTopicsData = recommendedTopicsFile.content as Record<string, unknown>;
      const topicsYourTopics = recommendedTopicsData.topics_your_topics as Record<string, unknown>[];

      if (Array.isArray(topicsYourTopics)) {
        topicsYourTopics.forEach((topic: unknown) => {
          const typedTopic = topic as RecommendedTopic;
          if (typedTopic && typedTopic.string_map_data) {
            recommendedTopics.push(typedTopic);
          }
        });
      }
    } catch (error) {
      console.warn('Error parsing recommended topics data:', error);
    }
  }

  // Parse posts data
  const postsFile = files.find(f => f.path.includes('your_instagram_activity/media/posts_1.json'));
  if (postsFile?.content) {
    try {
      const postsData = postsFile.content as InstagramPost[];
      if (Array.isArray(postsData)) {
        posts.push(...postsData);
      }
    } catch (error) {
      console.warn('Error parsing posts data:', error);
    }
  }

  // Parse stories data
  const storiesFile = files.find(f => f.path.includes('your_instagram_activity/media/stories.json'));
  if (storiesFile?.content) {
    try {
      const storiesData = storiesFile.content as InstagramStory;
      if (storiesData && storiesData.ig_stories) {
        stories.ig_stories = storiesData.ig_stories;
      }
    } catch (error) {
      console.warn('Error parsing stories data:', error);
    }
  }

  // Update user counts
  if (user) {
    user.followers_count = followers.length;
    user.following_count = following.length;
  }

  return {
    user,
    followers,
    following,
    blockedProfiles,
    pendingFollowRequests,
    recentFollowRequests,
    recentlyUnfollowed,
    removedSuggestions,
    locationsOfInterest,
    personalInfo,
    profileChanges,
    recommendedTopics,
    posts,
    stories,
  };
}

// Progress callback type for real-time extraction updates
export type ExtractionProgressCallback = (progress: number) => void;

// Main function to extract and parse Instagram zip file
export async function extractInstagramZip(
  file: File,
  onProgress?: ExtractionProgressCallback
): Promise<ZipExtractionResult> {
  try {
    const zip = new JSZip();

    // Report initial loading progress (0-10%)
    onProgress?.(5);

    const zipContent = await zip.loadAsync(file);

    onProgress?.(10);

    const extractedFiles: ExtractedFile[] = [];

    // Get all file entries for progress tracking
    const fileEntries = Object.entries(zipContent.files).filter(([, entry]) => !entry.dir);
    const totalFiles = fileEntries.length;
    let processedFiles = 0;

    // Process all files in the zip (extraction takes 10-95% of progress)
    for (const [relativePath, zipEntry] of fileEntries) {
      if (!zipEntry.dir) {
        const fileType = getFileType(zipEntry.name);
        let content: unknown = null;
        let url: string | undefined;

        try {
          if (fileType === 'json') {
            const text = await zipEntry.async('text');
            content = JSON.parse(text);
          } else if (fileType === 'image' || fileType === 'video') {
            // Only create URLs for media files in the media folder
            if (relativePath.includes('media/')) {
              const blob = await zipEntry.async('blob');
              url = URL.createObjectURL(blob);
              console.log(`Created URL for ${fileType}: ${relativePath} -> ${url}`);
            } else {
              console.log(`Skipping ${fileType} file outside media folder: ${relativePath}`);
            }
          }
        } catch (error) {
          console.warn(`Error processing file ${zipEntry.name}:`, error);
          // For media files, still try to create URL even if there's an error
          if ((fileType === 'image' || fileType === 'video') && relativePath.includes('media/')) {
            try {
              const blob = await zipEntry.async('blob');
              url = URL.createObjectURL(blob);
              console.log(`Created URL for ${fileType} after error recovery: ${relativePath}`);
            } catch (secondError) {
              console.error(`Failed to create URL for ${relativePath}:`, secondError);
            }
          }
        }

        extractedFiles.push({
          name: zipEntry.name,
          path: relativePath,
          type: fileType,
          content,
          url,
          size: 0,
        });

        // Update progress: extraction phase is 10-95% of total progress
        processedFiles++;
        const extractionProgress = 10 + Math.round((processedFiles / totalFiles) * 85);
        onProgress?.(extractionProgress);
      }
    }

    // Report parsing phase start (parsing is fast, so minimal progress reserved)
    onProgress?.(96);

    // Parse the extracted data
    const {
      user,
      followers,
      following,
      blockedProfiles,
      pendingFollowRequests,
      recentFollowRequests,
      recentlyUnfollowed,
      removedSuggestions,
      locationsOfInterest,
      personalInfo,
      profileChanges,
      recommendedTopics,
      posts,
      stories,
    } = parseInstagramData(extractedFiles);

    // Report parsing complete
    onProgress?.(97);

    // Calculate unfollowers by finding raw data
    const followersFile = extractedFiles.find(f => f.path.includes('connections/followers_and_following/followers_1.json'));
    const followingFile = extractedFiles.find(f => f.path.includes('connections/followers_and_following/following.json'));

    let unfollowers: InstagramList[] = [];

    if (followersFile?.content && followingFile?.content) {
      try {
        const followersRawData = followersFile.content as Record<string, unknown>[];
        const followingRawData = followingFile.content as Record<string, unknown>;
        const relationshipsFollowing = followingRawData.relationships_following as Record<string, unknown>[];

        if (Array.isArray(followersRawData) && Array.isArray(relationshipsFollowing)) {
          // Convert new following structure to old structure format for unfollowers calculation
          const followingForUnfollowers = relationshipsFollowing.map((followed: unknown) => {
            const typedFollowed = followed as Record<string, unknown>;
            const stringListData = typedFollowed.string_list_data as Record<string, unknown>[];

            if (Array.isArray(stringListData) && stringListData.length > 0) {
              const item = stringListData[0] as Record<string, unknown>;

              // Handle new structure: username is in title field
              if (typedFollowed.title && typeof typedFollowed.title === 'string' && typedFollowed.title.trim() !== '') {
                return {
                  string_list_data: [{
                    value: typedFollowed.title as string,
                    timestamp: item.timestamp as number,
                    href: item.href as string
                  }]
                };
              }
              // Handle old structure: username is in value field
              else if (item.value) {
                return {
                  string_list_data: [{
                    value: item.value as string,
                    timestamp: item.timestamp as number,
                    href: item.href as string
                  }]
                };
              }
            }
            return null;
          }).filter(Boolean);

          const result = findUnfollowers(
            followersRawData as Array<{ string_list_data: Array<{ value: string; timestamp: number; href?: string }> }>,
            followingForUnfollowers as Array<{ string_list_data: Array<{ value: string; timestamp: number; href?: string }> }>
          );
          unfollowers = result.unfollowers;

          // Log the date filtering information for debugging
          if (result.dateFilterApplied) {
            console.log(`Unfollowers calculation: Applied date filter from ${new Date(result.lowestFollowersTimestamp * 1000).toISOString()}`);
            console.log(`Filtered following data: ${result.filteredFollowing} out of ${result.totalFollowing} entries`);
          }
        }
      } catch (error) {
        console.warn('Error calculating unfollowers:', error);
      }
    }

    // Report finalization
    onProgress?.(99);

    const result: ZipExtractionResult = {
      files: extractedFiles,
      userData: user,
      posts: posts || [],
      carousels: [],
      stories: stories || { ig_stories: [] },
      followers: followers || [],
      following: following || [],
      blockedProfiles: blockedProfiles || [],
      pendingFollowRequests: pendingFollowRequests || [],
      recentFollowRequests: recentFollowRequests || [],
      recentlyUnfollowed: recentlyUnfollowed || [],
      removedSuggestions: removedSuggestions || [],
      unfollowers: unfollowers || [],
      locationsOfInterest: locationsOfInterest || [],
      personalInfo: personalInfo || {},
      profileChanges: profileChanges || [],
      recommendedTopics: recommendedTopics || [],
      totalMediaCount: (posts?.length || 0) + (stories?.ig_stories?.length || 0),
      extractionDate: new Date().toISOString(),
    };

    // Report complete
    onProgress?.(100);

    return result;
  } catch (error) {
    console.error('Error extracting zip file:', error);
    throw new Error('Failed to extract Instagram data. Please make sure the file is a valid Instagram export zip.');
  }
}

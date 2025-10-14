import { ZipExtractionResult } from '@/types/instagram';

// Interface for essential connections data only
export interface EssentialConnectionsData {
  userData: ZipExtractionResult['userData'];
  followers: ZipExtractionResult['followers'];
  following: ZipExtractionResult['following'];
  unfollowers: ZipExtractionResult['unfollowers'];
  blockedProfiles: ZipExtractionResult['blockedProfiles'];
  pendingFollowRequests: ZipExtractionResult['pendingFollowRequests'];
  recentFollowRequests: ZipExtractionResult['recentFollowRequests'];
  recentlyUnfollowed: ZipExtractionResult['recentlyUnfollowed'];
  removedSuggestions: ZipExtractionResult['removedSuggestions'];
  locationsOfInterest: ZipExtractionResult['locationsOfInterest'];
  personalInfo: ZipExtractionResult['personalInfo'];
  profileChanges: ZipExtractionResult['profileChanges'];
  recommendedTopics: ZipExtractionResult['recommendedTopics'];
  extractionDate: string;
}

// Extract only essential connections data from the full result
export function extractEssentialConnectionsData(result: ZipExtractionResult): EssentialConnectionsData {
  return {
    userData: result.userData,
    followers: result.followers,
    following: result.following,
    unfollowers: result.unfollowers,
    blockedProfiles: result.blockedProfiles,
    pendingFollowRequests: result.pendingFollowRequests,
    recentFollowRequests: result.recentFollowRequests,
    recentlyUnfollowed: result.recentlyUnfollowed,
    removedSuggestions: result.removedSuggestions,
    locationsOfInterest: result.locationsOfInterest,
    personalInfo: result.personalInfo,
    profileChanges: result.profileChanges,
    recommendedTopics: result.recommendedTopics,
    extractionDate: result.extractionDate
  };
}

// Save essential connections data to localStorage
export function saveEssentialConnectionsData(data: EssentialConnectionsData): void {
  try {
    localStorage.setItem('instagramConnections', JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save essential connections data:', error);
    throw new Error('Failed to save connections data. Storage quota exceeded.');
  }
}

// Load essential connections data from localStorage
export function loadEssentialConnectionsData(): EssentialConnectionsData | null {
  try {
    const data = localStorage.getItem('instagramConnections');
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to load essential connections data:', error);
    return null;
  }
}

// Clear essential connections data
export function clearEssentialConnectionsData(): void {
  localStorage.removeItem('instagramConnections');
}

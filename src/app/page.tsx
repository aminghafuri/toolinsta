"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import InstructionsModal from "@/components/InstructionsModal"
import FileUpload from "@/components/FileUpload"
import UserProfile from "@/components/UserProfile"
import AnimatedText from "@/components/AnimatedText"
import InstagramLists from "@/components/InstagramLists"
import LocationsOfInterest from "@/components/LocationsOfInterest"
import PersonalInfoDisplay from "@/components/PersonalInfoDisplay"
import ProfileChangesDisplay from "@/components/ProfileChangesDisplay"
import RecommendedTopicsDisplay from "@/components/RecommendedTopicsDisplay"
import PostsDisplay from "@/components/PostsDisplay"
import StoriesDisplay from "@/components/StoriesDisplay"
import { ThemeToggle } from "@/components/theme-toggle"
import { ZipExtractionResult } from "@/types/instagram"
import { loadEssentialConnectionsData, saveEssentialConnectionsData, extractEssentialConnectionsData, EssentialConnectionsData } from "@/lib/essentialStorage"
import { Instagram, Upload, Download, Users, User, MapPin, History, Sparkles, HardDrive, ArrowRight } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InstagramLimitationsWarning, InstagramLimitationsInfo } from "@/components/InstagramLimitationsWarning"
import GooeyText from "@/components/GooeyText"

export default function Home() {
  const [extractedData, setExtractedData] = useState<ZipExtractionResult | null>(null)
  const [essentialData, setEssentialData] = useState<EssentialConnectionsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load data from localStorage on component mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('instagramData')
        if (savedData) {
          const parsedData = JSON.parse(savedData)
          // If it's a summary (has _isSummary flag), load essential connections data
          if (parsedData._isSummary) {
            // Load essential connections data first
            const essentialConnections = loadEssentialConnectionsData()
            if (essentialConnections) {
              setEssentialData(essentialConnections)
              // Set extracted data with essential data
              setExtractedData({
                userData: parsedData.userData,
                followers: essentialConnections.followers || [],
                following: essentialConnections.following || [],
                blockedProfiles: essentialConnections.blockedProfiles || [],
                pendingFollowRequests: essentialConnections.pendingFollowRequests || [],
                recentFollowRequests: essentialConnections.recentFollowRequests || [],
                recentlyUnfollowed: essentialConnections.recentlyUnfollowed || [],
                removedSuggestions: essentialConnections.removedSuggestions || [],
                unfollowers: essentialConnections.unfollowers || [],
                locationsOfInterest: essentialConnections.locationsOfInterest || [],
                personalInfo: essentialConnections.personalInfo || {},
                profileChanges: essentialConnections.profileChanges || [],
                recommendedTopics: essentialConnections.recommendedTopics || [],
                files: [],
                posts: [],
                carousels: [],
                stories: { ig_stories: [] },
                totalMediaCount: 0,
                extractionDate: parsedData.extractionDate,
                _isSummary: true
              })
            } else {
              // Fallback if no essential data
              setExtractedData({
                userData: parsedData.userData,
                followers: [],
                following: [],
                blockedProfiles: [],
                pendingFollowRequests: [],
                recentFollowRequests: [],
                recentlyUnfollowed: [],
                removedSuggestions: [],
                unfollowers: [],
                locationsOfInterest: [],
                personalInfo: {},
                profileChanges: [],
                recommendedTopics: [],
                files: [],
                posts: [],
                carousels: [],
                stories: { ig_stories: [] },
                totalMediaCount: 0,
                extractionDate: parsedData.extractionDate,
                _isSummary: true
              })
            }
          } else {
            setExtractedData(parsedData)
          }
        }
    } catch (error) {
      console.warn('Error loading saved data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleDataExtracted = (data: ZipExtractionResult) => {
    setExtractedData(data)
    
    // Clear warning closed states when new data is imported
    if (typeof window !== 'undefined') {
      localStorage.removeItem('instagram-warning-closed')
      localStorage.removeItem('instagram-info-closed')
    }
    
    // Always save essential data (connections, personal info, profile changes, locations)
    try {
      const essentialData = extractEssentialConnectionsData(data)
      saveEssentialConnectionsData(essentialData)
      setEssentialData(essentialData)
    } catch (error) {
      console.warn('Could not save essential data:', error)
    }
    
    // Try to store full data in localStorage (with error handling for large datasets)
    try {
      localStorage.setItem('instagramData', JSON.stringify(data))
    } catch (error) {
      console.warn('Could not save data to localStorage:', error)
      // If data is too large, store a summary instead
      try {
        const summary = {
          userData: data.userData,
          stats: {
            followersCount: data.followers.length,
            followingCount: data.following.length,
            unfollowersCount: data.unfollowers.length,
            blockedCount: data.blockedProfiles.length,
            pendingCount: data.pendingFollowRequests.length,
            recentCount: data.recentFollowRequests.length,
            unfollowedCount: data.recentlyUnfollowed.length,
            removedCount: data.removedSuggestions.length,
          },
          extractionDate: data.extractionDate,
          _isSummary: true
        }
        localStorage.setItem('instagramData', JSON.stringify(summary))
      } catch (summaryError) {
        console.warn('Could not save even summary to localStorage:', summaryError)
      }
    }
  }

  const handleClearData = () => {
    localStorage.removeItem('instagramData')
    localStorage.removeItem('instagramConnections')
    setExtractedData(null)
    setEssentialData(null)
  }


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-bl from-[#f9fafb] via-[#e0e7ff] to-[#fdf2f8] dark:from-[#181e29] dark:via-[#312e81] dark:to-[#21223b] relative overflow-x-hidden before:content-[''] before:absolute before:inset-0 before:-z-10 before:bg-[radial-gradient(60%_70%_at_25%_30%,rgba(99,102,241,0.13)_0%,transparent_70%),radial-gradient(40%_50%_at_80%_80%,rgba(217,70,239,0.08)_0%,transparent_65%),radial-gradient(50%_60%_at_80%_15%,rgba(16,185,129,0.09)_0%,transparent_75%)] dark:before:bg-[radial-gradient(60%_70%_at_20%_25%,rgba(129,140,248,0.05)_0%,transparent_70%),radial-gradient(38%_52%_at_70%_80%,rgba(236,72,153,0.056)_0%,transparent_68%),radial-gradient(60%_55%_at_85%_17%,rgba(6,182,212,0.09)_0%,transparent_75%)] before:blur-[44px] before:opacity-90">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between min-w-0">
            <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1">
              <Instagram className="h-6 w-6 sm:h-8 sm:w-8 text-pink-600 flex-shrink-0" />
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent truncate">
                Instagram Tool
              </h1>
            </div>
            
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              {extractedData && (
                <>
                  {/* Mobile: Storage icon, Desktop: Badge */}
                  <div className="p-1 border border-green-600 rounded-md flex-shrink-0 sm:hidden" title="Data Loaded">
                    <HardDrive className="h-4 w-4 text-green-600" />
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-600 text-center text-xs sm:text-sm hidden sm:inline-flex">
                    Data Loaded
                  </Badge>
                  <Button variant="outline" size="sm" onClick={handleClearData} className="text-xs sm:text-sm px-2 sm:px-3">
                    <span className="hidden sm:inline">Clear Data</span>
                    <span className="sm:hidden">Clear</span>
                  </Button>
                </>
              )}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        {!extractedData ? (
          // Upload Section
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] py-12 sm:py-16">
            {/* Hero Section */}
            <div className="text-center space-y-6 sm:space-y-8 mx-auto px-4">
              {/* Main Heading */}
              <div className="space-y-4">
                <h2 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black leading-[1.5] font-[var(--font-roboto)]">
                  <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 dark:from-cyan-400 dark:via-green-500 dark:to-amber-300 bg-clip-text text-transparent animate-gradient-x">
                  Instagram Tool That
                  <br />
                  Will Show You 
                  </span>
                </h2>
                  <GooeyText />
                
                <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-light">
                  Transform your Instagram data export into beautiful, organized insights. 
                  <span className="block mt-2 text-base sm:text-lg">
                    Discover your connections, explore your content, and understand your digital footprint.
                  </span>
                </p>
              </div>
              {/* CTA Section */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <InstructionsModal>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="group w-full sm:w-auto px-8 py-6 text-base sm:text-lg border-2 hover:border-primary transition-all duration-300"
                  >
                    <Download className="h-5 w-5 mr-2 group-hover:animate-bounce" />
                    How to Get Your Data
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </InstructionsModal>
              </div>
            </div>

            {/* Upload Section */}
            <div className="w-full max-w-2xl mx-auto mt-12 sm:mt-16 px-4">
              <div className="relative">
                {/* Decorative gradient background */}
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-blue-500/10 rounded-2xl blur-3xl -z-10" />
                
                {/* Upload Component */}
                <div className="relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 sm:p-8 shadow-lg">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 mb-4">
                      <Upload className="h-8 w-8 text-pink-600 dark:text-pink-400" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-semibold mb-2">
                      Upload Your Data
                    </h3>
                    <p className="text-sm sm:text-base text-muted-foreground">
                      Drag and drop your Instagram ZIP file or click to browse
                    </p>
                  </div>
                  <FileUpload onDataExtracted={handleDataExtracted} />
                </div>
              </div>
            </div>

            {/* Trust Indicator */}
            <div className="mt-12 sm:mt-16 text-center">
              <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-500/20">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                </span>
                Processed locally in your browser • No data sent to servers
              </p>
            </div>
          </div>
        ) : (
          // Data Display Section with Tabs
          <Tabs defaultValue="relationships" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="relationships" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Relationships</span>
                <span className="sm:hidden">Relations</span>
              </TabsTrigger>
              <TabsTrigger value="personal" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <User className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Personal Information</span>
                <span className="sm:hidden">Personal</span>
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <History className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Your Activity</span>
                <span className="sm:hidden">Activity</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="relationships" className="space-y-6">
              {/* User Profile */}
              {extractedData.userData && (
                <UserProfile user={extractedData.userData} />
              )}

              {/* Instagram Limitations Warning */}
              {extractedData && (
                <>
                  <InstagramLimitationsWarning 
                    followersData={extractedData.followers}
                    followingData={extractedData.following}
                  />
                  <InstagramLimitationsInfo />
                </>
              )}

              {/* Instagram Lists with Interactive Stats */}
              <InstagramLists
                followers={extractedData?._isSummary ? essentialData?.followers || [] : extractedData.followers || []}
                following={extractedData?._isSummary ? essentialData?.following || [] : extractedData.following || []}
                blockedProfiles={extractedData?._isSummary ? essentialData?.blockedProfiles || [] : extractedData.blockedProfiles || []}
                pendingFollowRequests={extractedData?._isSummary ? essentialData?.pendingFollowRequests || [] : extractedData.pendingFollowRequests || []}
                recentFollowRequests={extractedData?._isSummary ? essentialData?.recentFollowRequests || [] : extractedData.recentFollowRequests || []}
                recentlyUnfollowed={extractedData?._isSummary ? essentialData?.recentlyUnfollowed || [] : extractedData.recentlyUnfollowed || []}
                removedSuggestions={extractedData?._isSummary ? essentialData?.removedSuggestions || [] : extractedData.removedSuggestions || []}
                unfollowers={extractedData?._isSummary ? essentialData?.unfollowers || [] : extractedData.unfollowers || []}
              />
            </TabsContent>

            <TabsContent value="personal" className="space-y-6">
              {/* Nested Tabs for Personal Information */}
              <Tabs defaultValue="info" className="w-full">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
                  <TabsTrigger value="info" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                    <User className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Info</span>
                    <span className="sm:hidden">Info</span>
                  </TabsTrigger>
                  <TabsTrigger value="locations" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                    <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Locations</span>
                    <span className="sm:hidden">Locations</span>
                  </TabsTrigger>
                  <TabsTrigger value="changes" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                    <History className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Changes</span>
                    <span className="sm:hidden">Changes</span>
                  </TabsTrigger>
                  <TabsTrigger value="topics" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                    <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Topics</span>
                    <span className="sm:hidden">Topics</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="info" className="space-y-6">
                  {/* Personal Information */}
                  {extractedData?.personalInfo && (
                    <PersonalInfoDisplay 
                      personalInfo={extractedData.personalInfo}
                      profilePhotoUrl={extractedData.personalInfo.profilePhotoUri ? 
                        extractedData.files?.find(f => f.path.includes(extractedData.personalInfo.profilePhotoUri!))?.url : 
                        undefined
                      }
                    />
                  )}
                </TabsContent>

                <TabsContent value="locations" className="space-y-6">
                  {/* Locations of Interest */}
                  {extractedData?.locationsOfInterest && extractedData.locationsOfInterest.length > 0 && (
                    <LocationsOfInterest locations={extractedData.locationsOfInterest} />
                  )}
                </TabsContent>

                <TabsContent value="changes" className="space-y-6">
                  {/* Profile Changes */}
                  {extractedData?.profileChanges && extractedData.profileChanges.length > 0 && (
                    <ProfileChangesDisplay profileChanges={extractedData.profileChanges} />
                  )}
                </TabsContent>

                <TabsContent value="topics" className="space-y-6">
                  {/* Recommended Topics */}
                  {extractedData?.recommendedTopics && extractedData.recommendedTopics.length > 0 && (
                    <RecommendedTopicsDisplay recommendedTopics={extractedData.recommendedTopics} />
                  )}
                </TabsContent>
              </Tabs>
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              {/* Your Activity - Media Only */}
              <Tabs defaultValue="posts" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="posts" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                    <Instagram className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Posts</span>
                    <span className="sm:hidden">Posts</span>
                  </TabsTrigger>
                  <TabsTrigger value="stories" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                    <History className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Stories</span>
                    <span className="sm:hidden">Stories</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="posts" className="space-y-6">
                  {/* Posts Display */}
                  {extractedData?.posts && extractedData.posts.length > 0 ? (
                    <PostsDisplay 
                      posts={extractedData.posts} 
                      files={extractedData.files} 
                    />
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No posts found</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="stories" className="space-y-6">
                  {/* Stories Display */}
                  {extractedData?.stories && extractedData.stories.ig_stories && extractedData.stories.ig_stories.length > 0 ? (
                    <StoriesDisplay 
                      stories={extractedData.stories} 
                      files={extractedData.files} 
                    />
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No stories found</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </TabsContent>
          </Tabs>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm mt-16">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
          <div className="text-center text-muted-foreground">
            <p>Built with Next.js 15, Tailwind CSS v4, and TypeScript</p>
            <p className="text-sm mt-2">Your data stays in your browser - no servers involved</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
 
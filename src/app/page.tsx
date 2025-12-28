"use client"

import { useState, useEffect, useLayoutEffect, useRef } from "react"
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
import { Instagram, Upload, Download, Users, User, MapPin, History, Sparkles, HardDrive, ArrowRight, Github, Heart, ExternalLink, Code2 } from "lucide-react"
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

  const topRef = useRef<HTMLDivElement>(null)
  const mainRef = useRef<HTMLDivElement>(null)

  // Robust scroll to top when data is loaded
  useLayoutEffect(() => {
    if (extractedData) {
      // Immediate scroll
      window.scrollTo(0, 0)
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0

      // Scroll anchor into view as backup
      topRef.current?.scrollIntoView({ behavior: "instant", block: "start" })

      // Small timeout to handle any layout shifts after render
      const timeoutId = setTimeout(() => {
        window.scrollTo(0, 0)
        topRef.current?.scrollIntoView({ behavior: "instant", block: "start" })
      }, 10)

      return () => clearTimeout(timeoutId)
    }
  }, [extractedData])

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
    <div ref={mainRef} className="min-h-screen flex flex-col bg-gradient-to-br from-[#f8fafc] via-[#e0e7ff] to-[#fce7f3] dark:bg-gradient-to-br dark:from-[#000000] dark:via-[#050508] dark:to-[#030308] relative overflow-x-hidden">
      {/* Subtle gradient overlay for visual depth */}
      <div ref={topRef} className="absolute top-0 left-0 w-full h-px -z-50 opacity-0 pointer-events-none" />
      {/* Header */}
      <header className="border-b bg-[rgba(255,255,255,0.8)] dark:bg-[rgba(0,0,0,0.8)] dark:border-[#1f1f1f] backdrop-blur-sm sticky top-0 z-40">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between min-w-0">
            <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1">
              <img 
                src="/icons/icon-192x192.png" 
                alt="ToolInsta Logo" 
                className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0 rounded-md"
              />
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent truncate">
                Toolinsta
              </h1>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              {extractedData && (
                <>
                  {/* Mobile: Storage icon, Desktop: Badge */}
                  <div className="h-8 w-8 border border-green-600 rounded-md flex-shrink-0 sm:hidden flex items-center justify-center" title="Data Loaded">
                    <HardDrive className="h-4 w-4 text-green-600" />
                  </div>
                  <Badge variant="outline" className="h-8 rounded-md text-green-600 border-green-600 text-center text-xs sm:text-sm hidden sm:inline-flex items-center">
                    Data Loaded
                  </Badge>
                  <Button variant="outline" size="sm" onClick={handleClearData} className="h-8 text-xs sm:text-sm px-2 sm:px-3">
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

      <main className="flex-1 w-full max-w-7xl min-h-screen mx-auto px-3 sm:px-4 py-6 sm:py-8">
        {!extractedData ? (
          // Upload Section
          <div className="flex flex-col items-center justify-start sm:justify-center w-full sm:min-h-[calc(100vh-200px)] sm:py-16">
            {/* Hero Section */}
            <div className="text-center space-y-6 sm:space-y-8 mx-2 md:mx-auto min-h-[calc(100vh-80px)] flex flex-col justify-center sm:min-h-fit sm:block sm:h-auto w-full">
              {/* Main Heading */}
              <div className="sm:space-y-4 lg:space-y-8">
                <h2 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[1.5]">
                  <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent animate-gradient-x">
                    Drop Your Data
                    <br />
                    And Manage
                    <br />
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
              {/* CTA Section - Minimal Animated Help Button */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <InstructionsModal>
                  <button className="group relative cursor-pointer focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:ring-offset-2 focus:ring-offset-transparent rounded-full transition-all duration-300">
                    {/* Pulsing glow behind button - stronger in light mode */}
                    <div className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-pink-400/40 via-purple-400/40 to-pink-400/40 dark:from-pink-500/20 dark:via-purple-500/20 dark:to-pink-500/20 blur-md animate-pulse" />

                    {/* Minimal pill button with shimmer */}
                    <div className="relative flex items-center gap-2.5 px-6 py-3 sm:px-8 sm:py-3.5 rounded-full border backdrop-blur-sm border-pink-500 dark:border-pink-400 bg-pink-100/50 dark:bg-pink-950/30 transition-all duration-300 shadow-lg shadow-pink-500/25 overflow-hidden">

                      {/* Active shimmer sweep - pink tinted for light mode visibility */}
                      <div className="absolute inset-0 -translate-x-full animate-[shimmer_3s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-pink-300/40 dark:via-white/15 to-transparent" />

                      {/* Icon with gentle bounce */}
                      <Download className="h-4 w-4 sm:h-5 sm:w-5 text-pink-500 dark:text-pink-400 animate-[icon-bounce_2s_ease-in-out_infinite] group-hover:scale-110 transition-transform duration-300" />

                      {/* Text */}
                      <span className="relative text-sm sm:text-base font-medium text-slate-700 dark:text-slate-200">
                        How to Get Your Data
                      </span>

                      {/* Arrow slides in on hover */}
                      <ArrowRight className="h-4 w-4 text-pink-500 dark:text-pink-400 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                    </div>
                  </button>
                </InstructionsModal>
              </div>
            </div>

            {/* Upload Section */}
            <div className="w-full max-w-2xl mx-auto mt-12 sm:mt-16 px-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <div className="relative group">
                {/* Decorative gradient background - now reactive */}
                <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />

                {/* Upload Component Wrapper */}
                <div className="relative bg-white/70 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-[2rem] p-4 sm:p-6 shadow-2xl overflow-hidden shadow-pink-500/5">
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
          <Tabs defaultValue="relationships" className="w-full animate-fade-in-up">
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
              {extractedData?.userData && (
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
              {(() => {
                const followers = extractedData?._isSummary ? essentialData?.followers || [] : extractedData.followers || [];
                const following = extractedData?._isSummary ? essentialData?.following || [] : extractedData.following || [];
                const followingUsernames = new Set(following.map(f => f.username.toLowerCase()));
                const followerUsernames = new Set(followers.map(f => f.username.toLowerCase()));

                // Not followed back - followers whom the user hasn't followed back
                const notFollowedBack = followers.filter(
                  follower => !followingUsernames.has(follower.username.toLowerCase())
                );

                // Mutual friends - users who both follow the user AND are followed by the user
                const mutualFriends = followers.filter(
                  follower => followingUsernames.has(follower.username.toLowerCase())
                );

                return (
                  <InstagramLists
                    followers={followers}
                    following={following}
                    blockedProfiles={extractedData?._isSummary ? essentialData?.blockedProfiles || [] : extractedData.blockedProfiles || []}
                    pendingFollowRequests={extractedData?._isSummary ? essentialData?.pendingFollowRequests || [] : extractedData.pendingFollowRequests || []}
                    recentFollowRequests={extractedData?._isSummary ? essentialData?.recentFollowRequests || [] : extractedData.recentFollowRequests || []}
                    recentlyUnfollowed={extractedData?._isSummary ? essentialData?.recentlyUnfollowed || [] : extractedData.recentlyUnfollowed || []}
                    removedSuggestions={extractedData?._isSummary ? essentialData?.removedSuggestions || [] : extractedData.removedSuggestions || []}
                    unfollowers={extractedData?._isSummary ? essentialData?.unfollowers || [] : extractedData.unfollowers || []}
                    notFollowedBack={notFollowedBack}
                    mutualFriends={mutualFriends}
                  />
                );
              })()}
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
                  <PersonalInfoDisplay
                    personalInfo={extractedData?.personalInfo || {}}
                    profilePhotoUrl={extractedData?.personalInfo?.profilePhotoUri ?
                      extractedData.files?.find(f => f.path.includes(extractedData.personalInfo.profilePhotoUri!))?.url :
                      undefined
                    }
                    isSummary={!!extractedData?._isSummary}
                  />
                </TabsContent>

                <TabsContent value="locations" className="space-y-6">
                  {/* Locations of Interest */}
                  <LocationsOfInterest
                    locations={extractedData?.locationsOfInterest || []}
                    isSummary={!!extractedData?._isSummary}
                  />
                </TabsContent>

                <TabsContent value="changes" className="space-y-6">
                  {/* Profile Changes */}
                  <ProfileChangesDisplay
                    profileChanges={extractedData?.profileChanges || []}
                    isSummary={!!extractedData?._isSummary}
                  />
                </TabsContent>

                <TabsContent value="topics" className="space-y-6">
                  {/* Recommended Topics */}
                  <RecommendedTopicsDisplay
                    recommendedTopics={extractedData?.recommendedTopics || []}
                    isSummary={!!extractedData?._isSummary}
                  />
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
                  <PostsDisplay
                    posts={extractedData?.posts || []}
                    files={extractedData?.files || []}
                    isSummary={!!extractedData?._isSummary}
                  />
                </TabsContent>

                <TabsContent value="stories" className="space-y-6">
                  {/* Stories Display */}
                  <StoriesDisplay
                    stories={extractedData?.stories || { ig_stories: [] }}
                    files={extractedData?.files || []}
                    isSummary={!!extractedData?._isSummary}
                  />
                </TabsContent>
              </Tabs>
            </TabsContent>
          </Tabs>
        )}
      </main>

      {/* Footer */}
      <footer className="relative border-t bg-[rgba(255,255,255,0.9)] dark:bg-[rgba(0,0,0,0.9)] dark:border-[#1f1f1f] backdrop-blur-xl mt-16 overflow-hidden">
        {/* Decorative gradient accent at top */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/50 to-transparent" />
        
        {/* Subtle background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-pink-500/[0.02] via-purple-500/[0.02] to-transparent dark:from-pink-500/[0.03] dark:via-purple-500/[0.03] pointer-events-none" />
        
        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="flex flex-col items-center gap-8">
            
            {/* Open Source Badge & Message */}
            <div className="flex flex-col items-center gap-4">
              {/* Developer intro */}
              <p className="flex items-center gap-2 text-muted-foreground text-sm sm:text-base">
                <span>Made with</span>
                <Heart className="h-4 w-4 text-red-500 fill-red-500 animate-pulse" />
                <span>by</span>
                <a 
                  href="https://github.com/aminghafuri" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-semibold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
                >
                  Amin Ghafuri
                </a>
              </p>
            </div>

            {/* Social Links */}
            <div className="flex flex-col md:flex-row items-center gap-4">
              {/* GitHub Link */}
              <a
                href="https://github.com/aminghafuri/toolinsta"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-center justify-center gap-2.5 min-w-[180px] px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-white/5 hover:border-gray-900 dark:hover:border-white/30 transition-all duration-300 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-white/5 hover:-translate-y-0.5"
              >
                <Github className="h-5 w-5 text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-300" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-300">
                  Star on GitHub
                </span>
                <ExternalLink className="h-3.5 w-3.5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-300" />
              </a>

              {/* ProductHunt Link */}
              <a
                href="https://producthunt.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-center justify-center gap-2.5 min-w-[180px] px-5 py-2.5 rounded-xl border border-orange-200 dark:border-orange-900/50 bg-orange-50/50 dark:bg-orange-500/10 hover:border-orange-400 dark:hover:border-orange-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10 hover:-translate-y-0.5"
              >
                {/* ProductHunt Icon (custom SVG) */}
                <svg className="h-5 w-5 text-orange-500 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-300" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2zm-1 5v10h2v-3h2c2.21 0 4-1.79 4-4s-1.79-4-4-4h-4zm2 2h2c1.105 0 2 .895 2 2s-.895 2-2 2h-2V9z"/>
                </svg>
                <span className="text-sm font-medium text-orange-600 dark:text-orange-400 group-hover:text-orange-700 dark:group-hover:text-orange-300 transition-colors duration-300">
                  ProductHunt
                </span>
                <ExternalLink className="h-3.5 w-3.5 text-orange-400 group-hover:text-orange-500 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-300" />
              </a>
            </div>

            {/* Divider */}
            <div className="w-full max-w-xs h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent" />

            {/* Tech Stack & Privacy */}
            <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-8">
              {/* Tech Stack */}
              <div className="flex items-center gap-2 flex-wrap justify-center">
                <span className="text-xs text-muted-foreground">Built with</span>
                <div className="flex items-center gap-1.5">
                  <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                    Next.js 15
                  </span>
                  <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                    Tailwind v4
                  </span>
                  <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                    TypeScript
                  </span>
                </div>
              </div>

              {/* Privacy indicator */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span>100% Client-side • Your data never leaves your browser</span>
              </div>
            </div>

            {/* Copyright */}
            <p className="text-xs text-muted-foreground/60">
              © {new Date().getFullYear()} Instagram Tool. MIT License.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
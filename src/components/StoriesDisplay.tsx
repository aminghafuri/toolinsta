"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { InstagramStory, ExtractedFile } from "@/types/instagram"
import { Play, X, Calendar, Share2 } from "lucide-react"
import { shareMedia } from "@/lib/shareUtils"

interface StoriesDisplayProps {
  stories: InstagramStory
  files: ExtractedFile[]
}

export default function StoriesDisplay({ stories, files }: StoriesDisplayProps) {
  const [selectedStory, setSelectedStory] = useState<number | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Helper function to get file URL from URI with improved matching
  const getFileUrl = (uri: string): string | null => {
    // First try exact path match
    let file = files.find(f => f.path === uri)
    
    // If not found, try partial match (for cases where path might be slightly different)
    if (!file) {
      const uriParts = uri.split('/')
      const fileName = uriParts[uriParts.length - 1]
      file = files.find(f => f.name === fileName)
    }
    
    // If still not found, try more flexible matching
    if (!file) {
      file = files.find(f => f.path.includes(uri) || uri.includes(f.name))
    }
    
    return file?.url || null
  }

  // Helper function to format timestamp
  const formatDate = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Enhanced media type detection using multiple methods
  const getMediaType = (media: { 
    media_metadata: { 
      video_metadata?: unknown
      photo_metadata?: unknown
    }
    uri: string
  }): 'photo' | 'video' => {
    // Method 1: Check metadata (primary method)
    if (media.media_metadata.video_metadata) {
      return 'video'
    }
    if (media.media_metadata.photo_metadata) {
      return 'photo'
    }
    
    // Method 2: Check file extension as fallback
    const uriParts = media.uri.split('.')
    const extension = uriParts[uriParts.length - 1]?.toLowerCase()
    
    if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(extension || '')) {
      return 'video'
    }
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(extension || '')) {
      return 'photo'
    }
    
    // Method 3: Check if we can find the file and determine its type
    const file = files.find(f => f.path.includes(media.uri) || media.uri.includes(f.name))
    if (file?.type === 'video') {
      return 'video'
    }
    if (file?.type === 'image') {
      return 'photo'
    }
    
    // Default to photo if uncertain
    console.warn('Could not determine media type for:', media.uri)
    return 'photo'
  }

  // Helper function to decode emoji and Unicode characters
  const decodeEmoji = (encodedString?: string): string => {
    if (!encodedString || typeof encodedString !== 'string') {
      return '';
    }
    try {
      // First, convert Unicode escape sequences to actual characters
      const unicodeDecoded = encodedString.replace(/\\u([0-9a-fA-F]{4})/g, (match, code) => {
        const charCode = parseInt(code, 16);
        return String.fromCharCode(charCode);
      });
      
      // Then use the escape() + decodeURIComponent() trick
      return decodeURIComponent(escape(unicodeDecoded));
    } catch (error) {
      console.error("Failed to decode emoji string:", error);
      // Return original string if decoding fails
      return encodedString;
    }
  }

  // Helper function to handle sharing
  const handleShare = async (story: typeof stories.ig_stories[0]) => {
    const mediaType = getMediaType(story)
    const fileUrl = getFileUrl(story.uri)
    
    if (!fileUrl) {
      console.error('No file URL available for sharing')
      return
    }

    const title = story.title || `Instagram story`
    const text = `Check out this story from my Instagram archive`
    
    // Convert 'photo' to 'image' for the shareMedia function
    const shareMediaType = mediaType === 'photo' ? 'image' : 'video'
    
    try {
      await shareMedia(fileUrl, shareMediaType, title, text)
    } catch (error) {
      console.error('Failed to share story:', error)
    }
  }

  // Helper functions for modal navigation
  const openModal = (storyIndex: number) => {
    setSelectedStory(storyIndex)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedStory(null)
  }

  // Group stories by date
  const groupStoriesByDate = () => {
    const grouped: { [key: string]: Array<{ originalIndex: number } & typeof stories.ig_stories[0]> } = {}
    
    stories.ig_stories.forEach((story, index) => {
      const date = new Date(story.creation_timestamp * 1000).toDateString()
      if (!grouped[date]) {
        grouped[date] = []
      }
      grouped[date].push({ ...story, originalIndex: index })
    })

    return grouped
  }

  const groupedStories = groupStoriesByDate()

  if (!stories?.ig_stories || stories.ig_stories.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No stories found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedStories).map(([date, dayStories]) => (
        <div key={date} className="space-y-4">
          {/* Date Header */}
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{new Date(date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</span>
            <Badge variant="outline">{dayStories.length} stories</Badge>
          </div>

          {/* Instagram-style Grid for this date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-1">
            {dayStories.map((story) => (
              <div
                key={story.originalIndex}
                className="relative aspect-square cursor-pointer group"
                onClick={() => openModal(story.originalIndex)}
              >
                {/* Story Thumbnail */}
                <div className="relative w-full h-full overflow-hidden">
                  {(() => {
                    const mediaType = getMediaType(story)
                    const fileUrl = getFileUrl(story.uri)
                    
                    // Debug logging for troubleshooting
                    if (!fileUrl) {
                      console.warn('No file URL found for story:', story.uri)
                    }
                    
                    if (mediaType === 'video') {
                      return (
                        <div className="relative w-full h-full">
                          <video
                            src={fileUrl || ''}
                            className="w-full h-full object-cover"
                            muted
                            onError={(e) => {
                              console.error('Video load error for:', story.uri, e)
                            }}
                            onLoadStart={() => {
                              console.log('Video loading started for:', story.uri)
                            }}
                          />
                          <div className="absolute top-2 right-2">
                            <Play className="w-4 h-4 text-white drop-shadow-lg" />
                          </div>
                          {/* Fallback for failed video loads */}
                          {!fileUrl && (
                            <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                              <div className="text-center text-white text-xs">
                                <Play className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p>Video unavailable</p>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    } else {
                      return (
                        <div className="relative w-full h-full">
                          <Image
                            src={fileUrl || ''}
                            alt="Story thumbnail"
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-200"
                            onError={(e) => {
                              console.error('Image load error for:', story.uri, e)
                            }}
                            onLoad={() => {
                              console.log('Image loaded successfully for:', story.uri)
                            }}
                          />
                          {/* Fallback for failed image loads */}
                          {!fileUrl && (
                            <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                              <div className="text-center text-white text-xs">
                                <div className="w-8 h-8 mx-auto mb-2 bg-gray-600 rounded flex items-center justify-center">
                                  📷
                                </div>
                                <p>Image unavailable</p>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    }
                  })()}
                  
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-4 text-white">
                      <div className="flex items-center gap-1">
                        <Play className="w-5 h-5" />
                        <span className="text-sm font-medium">View</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Modal for full story view */}
      {isModalOpen && selectedStory !== null && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-md rounded-lg max-w-7xl max-h-[95vh] overflow-hidden relative border border-white/20">
            {/* Close Button - positioned on top of image */}
            <Button 
              variant="ghost" 
              size="sm"
              className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm"
              onClick={closeModal}
            >
              <X className="w-4 h-4" />
            </Button>
            
            {/* Share Button - positioned on top of image */}
            <Button 
              variant="ghost" 
              size="sm"
              className="absolute top-4 right-16 z-10 bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm"
              onClick={() => handleShare(stories.ig_stories[selectedStory])}
            >
              <Share2 className="w-4 h-4" />
            </Button>
            
            {(() => {
              const story = stories.ig_stories[selectedStory]
              return (
                <div className="relative">
                  {/* Story Media */}
                  <div className="relative">
                    {(() => {
                      const mediaType = getMediaType(story)
                      const fileUrl = getFileUrl(story.uri)
                      
                      if (mediaType === 'video') {
                        return (
                          <video
                            src={fileUrl || ''}
                            controls
                            autoPlay
                            className="w-full h-auto max-h-[80vh] object-contain rounded"
                            onError={(e) => {
                              console.error('Modal video load error for:', story.uri, e)
                            }}
                          />
                        )
                      } else {
                        return (
                          <Image
                            src={fileUrl || ''}
                            alt="Story media"
                            width={1200}
                            height={800}
                            className="w-full h-auto max-h-[80vh] object-contain rounded"
                            onError={(e) => {
                              console.error('Modal image load error for:', story.uri, e)
                            }}
                          />
                        )
                      }
                    })()}
                  </div>
                
                  {/* Story Title and Date - positioned under the image */}
                  <div className="p-4 bg-white/5 backdrop-blur-sm">
                    {/* Story Title */}
                    {story.title && (
                      <div className="mb-3">
                        <p className="text-white text-sm leading-relaxed">{decodeEmoji(story.title)}</p>
                      </div>
                    )}
                    
                    {/* Story Date */}
                    <div className="text-white/70 text-xs">
                      {formatDate(story.creation_timestamp)}
                    </div>
                  </div>
                </div>
              )
            })()}
          </div>
        </div>
      )}
    </div>
  )
}
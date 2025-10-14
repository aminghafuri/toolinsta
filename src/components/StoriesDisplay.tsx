"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { InstagramStory, ExtractedFile } from "@/types/instagram"
import { Play, X, Calendar } from "lucide-react"

interface StoriesDisplayProps {
  stories: InstagramStory
  files: ExtractedFile[]
}

export default function StoriesDisplay({ stories, files }: StoriesDisplayProps) {
  const [selectedStory, setSelectedStory] = useState<number | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Helper function to get file URL from URI
  const getFileUrl = (uri: string): string | null => {
    const file = files.find(f => f.path.includes(uri))
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

  // Helper function to get media type
  const getMediaType = (media: { media_metadata: { video_metadata?: unknown } }): 'photo' | 'video' => {
    return media.media_metadata.video_metadata ? 'video' : 'photo'
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
                  {getMediaType(story) === 'video' ? (
                    <div className="relative w-full h-full">
                      <video
                        src={getFileUrl(story.uri) || ''}
                        className="w-full h-full object-cover"
                        muted
                      />
                      <div className="absolute top-2 right-2">
                        <Play className="w-4 h-4 text-white drop-shadow-lg" />
                      </div>
                    </div>
                  ) : (
                    <Image
                      src={getFileUrl(story.uri) || ''}
                      alt="Story thumbnail"
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  )}
                  
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
            
            {(() => {
              const story = stories.ig_stories[selectedStory]
              return (
                <div className="relative">
                  {/* Story Media */}
                  <div className="relative">
                    {getMediaType(story) === 'video' ? (
                      <video
                        src={getFileUrl(story.uri) || ''}
                        controls
                        autoPlay
                        className="w-full h-auto max-h-[80vh] object-contain rounded"
                      />
                    ) : (
                      <Image
                        src={getFileUrl(story.uri) || ''}
                        alt="Story media"
                        width={1200}
                        height={800}
                        className="w-full h-auto max-h-[80vh] object-contain rounded"
                      />
                    )}
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
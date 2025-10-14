"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { InstagramPost, InstagramCarousel, InstagramStory, UnifiedMedia } from "@/types/instagram"
import { Heart, MessageCircle, Calendar, MapPin, Images, Camera } from "lucide-react"
import Image from "next/image"

interface MediaGalleryProps {
  posts: InstagramPost[]
  carousels: InstagramCarousel[]
  stories: InstagramStory[]
}

const MediaGallery = ({ posts, carousels, stories }: MediaGalleryProps) => {
  const [selectedTab, setSelectedTab] = useState<'posts' | 'carousels' | 'stories'>('posts')
  const [selectedMedia, setSelectedMedia] = useState<UnifiedMedia | null>(null)

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatNumber = (num?: number) => {
    if (!num) return "0"
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  // Helper function to transform different media types into unified format
  const transformToUnifiedMedia = (): UnifiedMedia[] => {
    const unifiedMedia: UnifiedMedia[] = []

    // Transform posts
    posts.forEach((post, index) => {
      unifiedMedia.push({
        type: 'post',
        id: `post-${index}`,
        timestamp: new Date(post.creation_timestamp * 1000).toISOString(),
        media_url: post.media[0]?.uri || '',
        caption: post.title,
        title: post.title,
        creation_timestamp: post.creation_timestamp,
        media: post.media,
        likes_count: 0, // Posts don't have likes in this structure
        comments_count: 0, // Posts don't have comments in this structure
      })
    })

    // Transform carousels
    carousels.forEach((carousel) => {
      unifiedMedia.push({
        type: 'carousel',
        id: carousel.id,
        timestamp: new Date(carousel.timestamp).toISOString(),
        media_url: carousel.media_url,
        caption: carousel.caption,
        likes_count: carousel.likes_count,
        comments_count: carousel.comments_count,
        location: carousel.location,
        dimensions: carousel.dimensions,
        media_type: 'carousel',
        children: carousel.children,
      })
    })

    // Transform stories
    stories.forEach((story, index) => {
      story.ig_stories.forEach((storyMedia, storyIndex) => {
        unifiedMedia.push({
          type: 'story',
          id: `story-${index}-${storyIndex}`,
          timestamp: new Date(storyMedia.creation_timestamp * 1000).toISOString(),
          media_url: storyMedia.uri,
          caption: storyMedia.title,
          title: storyMedia.title,
          creation_timestamp: storyMedia.creation_timestamp,
          ig_stories: [storyMedia],
        })
      })
    })

    return unifiedMedia
  }

  const allMedia = transformToUnifiedMedia().sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  const filteredMedia = allMedia.filter(media => {
    if (selectedTab === 'posts') return media.type === 'post'
    if (selectedTab === 'carousels') return media.type === 'carousel'
    if (selectedTab === 'stories') return media.type === 'story'
    return true
  })

  const MediaCard = ({ media }: { media: UnifiedMedia }) => (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => setSelectedMedia(media)}
    >
      <div className="relative aspect-square overflow-hidden rounded-t-lg">
        {media.media_url ? (
          <Image
            src={media.media_url}
            alt={media.caption || 'Instagram media'}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <Camera className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        
        {/* Media type indicator */}
        <div className="absolute top-2 right-2">
          {media.type === 'carousel' && (
            <Badge variant="secondary" className="bg-black/50 text-white">
              <Images className="h-3 w-3 mr-1" />
              Carousel
            </Badge>
          )}
          {media.type === 'story' && (
            <Badge variant="secondary" className="bg-black/50 text-white">
              Story
            </Badge>
          )}
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="space-y-2">
          {media.caption && (
            <p className="text-sm line-clamp-2">{media.caption}</p>
          )}
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Heart className="h-3 w-3" />
                {formatNumber(media.likes_count)}
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="h-3 w-3" />
                {formatNumber(media.comments_count)}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(media.timestamp)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-6 w-6" />
            Media Gallery
          </CardTitle>
          <CardDescription>
            Explore your Instagram posts, carousels, and stories
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 justify-center">
        <Button
          variant={selectedTab === 'posts' ? 'default' : 'outline'}
          onClick={() => setSelectedTab('posts')}
        >
          Posts ({posts.length})
        </Button>
        <Button
          variant={selectedTab === 'carousels' ? 'default' : 'outline'}
          onClick={() => setSelectedTab('carousels')}
        >
          Carousels ({carousels.length})
        </Button>
        <Button
          variant={selectedTab === 'stories' ? 'default' : 'outline'}
          onClick={() => setSelectedTab('stories')}
        >
          Stories ({stories.length})
        </Button>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredMedia.map((media, index) => (
          <MediaCard key={`${media.type}-${media.id}-${index}`} media={media} />
        ))}
      </div>

      {filteredMedia.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No {selectedTab} found in your Instagram data.</p>
          </CardContent>
        </Card>
      )}

      {/* Media Modal */}
      {selectedMedia && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">
                  {selectedMedia.type === 'post' && 'Instagram Post'}
                  {selectedMedia.type === 'carousel' && 'Instagram Carousel'}
                  {selectedMedia.type === 'story' && 'Instagram Story'}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedMedia(null)}
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedMedia.media_url && (
                <div className="relative aspect-square overflow-hidden rounded-lg">
                  <Image
                    src={selectedMedia.media_url}
                    alt={selectedMedia.caption || 'Instagram media'}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              
              {selectedMedia.caption && (
                <div>
                  <h4 className="font-semibold mb-2">Caption</h4>
                  <p className="text-sm whitespace-pre-wrap">{selectedMedia.caption}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold">Likes:</span> {formatNumber(selectedMedia.likes_count)}
                </div>
                <div>
                  <span className="font-semibold">Comments:</span> {formatNumber(selectedMedia.comments_count)}
                </div>
                <div>
                  <span className="font-semibold">Date:</span> {formatDate(selectedMedia.timestamp)}
                </div>
                {selectedMedia.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span className="font-semibold">Location:</span> {selectedMedia.location.name}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default MediaGallery

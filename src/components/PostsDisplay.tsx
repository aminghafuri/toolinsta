"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { InstagramPost, ExtractedFile } from "@/types/instagram"
import { Play, ChevronLeft, ChevronRight, X } from "lucide-react"

interface PostsDisplayProps {
  posts: InstagramPost[]
  files: ExtractedFile[]
}

export default function PostsDisplay({ posts, files }: PostsDisplayProps) {
  const [selectedPost, setSelectedPost] = useState<number | null>(null)
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)
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

  // Helper function to decode emoji/unicode characters
  const decodeEmoji = (encodedString?: string) => {
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
  };




  // Helper functions for modal navigation
  const openModal = (postIndex: number) => {
    setSelectedPost(postIndex)
    setCurrentMediaIndex(0)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedPost(null)
    setCurrentMediaIndex(0)
  }

  const nextMedia = () => {
    if (selectedPost !== null && posts[selectedPost]) {
      const post = posts[selectedPost]
      setCurrentMediaIndex((prev) => 
        prev < post.media.length - 1 ? prev + 1 : 0
      )
    }
  }

  const prevMedia = () => {
    if (selectedPost !== null && posts[selectedPost]) {
      const post = posts[selectedPost]
      setCurrentMediaIndex((prev) => 
        prev > 0 ? prev - 1 : post.media.length - 1
      )
    }
  }

  // Helper function to get media type
  const getMediaType = (media: { media_metadata: { video_metadata?: unknown } }): 'photo' | 'video' => {
    return media.media_metadata.video_metadata ? 'video' : 'photo'
  }


  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No posts found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Instagram-style Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 xl:grid-cols-5 gap-1">
        {posts.map((post, postIndex) => (
          <div
            key={postIndex}
            className="relative aspect-square cursor-pointer group"
            onClick={() => openModal(postIndex)}
          >
            {/* Post Thumbnail */}
            <div className="relative w-full h-full overflow-hidden">
              {getMediaType(post.media[0]) === 'video' ? (
                <div className="relative w-full h-full">
                  <video
                    src={getFileUrl(post.media[0].uri) || ''}
                    className="w-full h-full object-cover"
                    muted
                  />
                  <div className="absolute top-2 right-2">
                    <Play className="w-4 h-4 text-white drop-shadow-lg" />
                  </div>
                </div>
              ) : (
                <Image
                  src={getFileUrl(post.media[0].uri) || ''}
                  alt="Post thumbnail"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                />
              )}
              
              {/* Carousel indicator for multiple media */}
              {post.media.length > 1 && (
                <div className="absolute top-2 left-2">
                  <div className="flex items-center gap-1 bg-black/50 text-white px-2 py-1 rounded-full text-xs">
                    <span>{post.media.length}</span>
                    <ChevronRight className="w-3 h-3" />
                  </div>
                </div>
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

      {/* Modal for full post view */}
      {isModalOpen && selectedPost !== null && (
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
              const post = posts[selectedPost]
              return (
                <div className="relative">
                  {/* Post Media */}
                  <div className="relative">
                    {post.media.length === 1 ? (
                      // Single media
                      getMediaType(post.media[0]) === 'video' ? (
                        <video
                          src={getFileUrl(post.media[0].uri) || ''}
                          controls
                          autoPlay
                          className="w-full h-auto max-h-[80vh] object-contain rounded"
                        />
                      ) : (
                        <Image
                          src={getFileUrl(post.media[0].uri) || ''}
                          alt="Post media"
                          width={1200}
                          height={800}
                          className="w-full h-auto max-h-[80vh] object-contain rounded"
                        />
                      )
                    ) : (
                      // Carousel
                      <div className="relative">
                        {getMediaType(post.media[currentMediaIndex]) === 'video' ? (
                          <video
                            src={getFileUrl(post.media[currentMediaIndex].uri) || ''}
                            controls
                            autoPlay
                            className="w-full h-auto max-h-[80vh] object-contain rounded"
                          />
                        ) : (
                          <Image
                            src={getFileUrl(post.media[currentMediaIndex].uri) || ''}
                            alt={`Post media ${currentMediaIndex + 1}`}
                            width={1200}
                            height={800}
                            className="w-full h-auto max-h-[80vh] object-contain rounded"
                          />
                        )}
                        
                        {/* Carousel Navigation */}
                        {post.media.length > 1 && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                              onClick={prevMedia}
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                              onClick={nextMedia}
                            >
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                            
                            {/* Carousel indicators */}
                            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                              {post.media.map((_, mediaIndex) => (
                                <button
                                  key={mediaIndex}
                                  className={`w-2 h-2 rounded-full transition-colors ${
                                    mediaIndex === currentMediaIndex ? 'bg-white' : 'bg-white/50'
                                  }`}
                                  onClick={() => setCurrentMediaIndex(mediaIndex)}
                                />
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                
                  {/* Post Title and Date - positioned under the image */}
                  <div className="p-4 bg-white/5 backdrop-blur-sm">
                    {/* Post Title */}
                    {post.title && (
                      <div className="mb-3">
                        <p className="text-white text-sm leading-relaxed">{decodeEmoji(post.title)}</p>
                      </div>
                    )}
                    
                    {/* Post Date */}
                    <div className="text-white/70 text-xs">
                      {formatDate(post.creation_timestamp)}
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

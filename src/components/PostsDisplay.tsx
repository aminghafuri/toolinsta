"use client"

import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import EmptyState from "@/components/EmptyState"
import { InstagramPost, ExtractedFile } from "@/types/instagram"
import { Play, ChevronLeft, ChevronRight, X, Share2, Instagram } from "lucide-react"
import { shareMedia } from "@/lib/shareUtils"

interface PostsDisplayProps {
  posts: InstagramPost[]
  files: ExtractedFile[]
  /** Whether the data is from a summary (after page refresh) */
  isSummary?: boolean
}

export default function PostsDisplay({ posts, files, isSummary = false }: PostsDisplayProps) {
  const [selectedPost, setSelectedPost] = useState<number | null>(null)
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Touch swipe support for Instagram-style carousel
  const touchStartX = useRef<number | null>(null)
  const touchCurrentX = useRef<number | null>(null)
  const [swipeOffset, setSwipeOffset] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const minSwipeDistance = 50 // Minimum swipe distance to trigger navigation

  const handleTouchStart = (e: React.TouchEvent) => {
    // Don't interfere with video controls
    if ((e.target as HTMLElement).tagName === 'VIDEO') return
    
    touchStartX.current = e.targetTouches[0].clientX
    touchCurrentX.current = e.targetTouches[0].clientX
    setIsTransitioning(false)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartX.current) return
    // Don't interfere with video controls
    if ((e.target as HTMLElement).tagName === 'VIDEO') return
    
    touchCurrentX.current = e.targetTouches[0].clientX
    const diff = touchCurrentX.current - touchStartX.current
    
    // Limit the swipe offset with resistance at edges
    if (selectedPost !== null && posts[selectedPost]) {
      const post = posts[selectedPost]
      const isFirstSlide = currentMediaIndex === 0
      const isLastSlide = currentMediaIndex === post.media.length - 1
      
      // Apply resistance at the edges (reduce movement by 70%)
      if ((isFirstSlide && diff > 0) || (isLastSlide && diff < 0)) {
        setSwipeOffset(diff * 0.3)
      } else {
        setSwipeOffset(diff)
      }
    }
  }

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchCurrentX.current) {
      setSwipeOffset(0)
      return
    }

    const distance = touchStartX.current - touchCurrentX.current
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance
    
    // Get the container width for calculating the full slide distance
    const containerWidth = containerRef.current?.offsetWidth || 400

    // Reset touch refs
    touchStartX.current = null
    touchCurrentX.current = null

    if (isLeftSwipe && selectedPost !== null && posts[selectedPost]) {
      const post = posts[selectedPost]
      if (currentMediaIndex < post.media.length - 1) {
        // Animate to full left (negative = slide left to show next)
        setIsTransitioning(true)
        setSwipeOffset(-containerWidth)
        
        // After animation completes, change index and reset
        setTimeout(() => {
          setIsTransitioning(false)
          setCurrentMediaIndex(prev => prev + 1)
          setSwipeOffset(0)
        }, 300)
        return
      }
    } else if (isRightSwipe && selectedPost !== null) {
      if (currentMediaIndex > 0) {
        // Animate to full right (positive = slide right to show previous)
        setIsTransitioning(true)
        setSwipeOffset(containerWidth)
        
        // After animation completes, change index and reset
        setTimeout(() => {
          setIsTransitioning(false)
          setCurrentMediaIndex(prev => prev - 1)
          setSwipeOffset(0)
        }, 300)
        return
      }
    }

    // If no slide change, animate back to center
    setIsTransitioning(true)
    setSwipeOffset(0)
    setTimeout(() => {
      setIsTransitioning(false)
    }, 300)
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  // Helper function to get file URL from URI
  const getFileUrl = (uri: string): string | null => {
    const file = files.find(f => f.path.includes(uri))
    return file?.url || null
  }

  // Helper function to format timestamp
  const formatDate = (timestamp: number): string => {
    // Debug logging to understand timestamp values
    console.log('Formatting timestamp:', timestamp, 'Type:', typeof timestamp)

    // Handle invalid or zero timestamps
    if (!timestamp || timestamp === 0 || isNaN(timestamp)) {
      console.warn('Invalid or zero timestamp:', timestamp)
      return 'Date not available'
    }

    // Handle both Unix timestamp (seconds) and milliseconds
    const date = new Date(timestamp > 1000000000000 ? timestamp : timestamp * 1000)

    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid timestamp:', timestamp)
      return 'Invalid Date'
    }

    return date.toLocaleDateString('en-US', {
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

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isModalOpen])

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

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      closeModal()
    }
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

  // Helper function to handle sharing
  const handleShare = async (post: InstagramPost, mediaIndex: number = 0) => {
    const media = post.media[mediaIndex]
    const mediaType = getMediaType(media)
    const fileUrl = getFileUrl(media.uri)

    if (!fileUrl) {
      console.error('No file URL available for sharing')
      return
    }

    const title = post.title || (media.title) || `Instagram ${mediaType}`
    const text = `Check out this ${mediaType} from my Instagram archive`

    // Convert 'photo' to 'image' for the shareMedia function
    const shareMediaType = mediaType === 'photo' ? 'image' : 'video'

    try {
      await shareMedia(fileUrl, shareMediaType, title, text)
    } catch (error) {
      console.error('Failed to share post:', error)
    }
  }

  if (!posts || posts.length === 0) {
    return (
      <EmptyState
        title="No Posts"
        icon={Instagram}
        isSummary={isSummary}
      />
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
      {isModalOpen && selectedPost !== null && mounted && createPortal(
        <div
          className="fixed top-0 left-0 w-full h-full bg-black/70 backdrop-blur-lg z-[9999] flex items-center justify-center p-4"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            margin: 0,
            padding: '1rem'
          }}
          onClick={handleBackdropClick}
        >
          <div
            className="bg-white/10 backdrop-blur-md rounded-lg max-w-7xl max-h-[95vh] overflow-y-auto relative border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
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
              // Debug logging for post structure
              console.log('Post structure:', post)
              console.log('Post title:', post.title)
              console.log('Post creation_timestamp:', post.creation_timestamp)

              // Fallback to media-level data if post-level data is missing
              const postTitle = post.title || (post.media[0]?.title) || ''
              const postTimestamp = post.creation_timestamp || (post.media[0]?.creation_timestamp) || 0

              console.log('Using title:', postTitle)
              console.log('Using timestamp:', postTimestamp)

              return (
                <div className="relative">
                  {/* Share Button - positioned on top of image */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-4 right-16 z-10 bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm"
                    onClick={() => handleShare(post, currentMediaIndex)}
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>

                  {/* Post Media */}
                  <div 
                    className="relative overflow-hidden"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    ref={containerRef}
                  >
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
                      // Instagram-style Carousel with adjacent slides using absolute positioning
                      <div className="relative">
                        {/* Previous slide - absolutely positioned to the left */}
                        {currentMediaIndex > 0 && (
                          <div 
                            className={`absolute top-0 right-full w-full h-full flex items-center justify-center ${isTransitioning ? 'transition-transform duration-300 ease-out' : ''}`}
                            style={{
                              transform: `translateX(${swipeOffset}px)`,
                            }}
                          >
                            {getMediaType(post.media[currentMediaIndex - 1]) === 'video' ? (
                              <video
                                src={getFileUrl(post.media[currentMediaIndex - 1].uri) || ''}
                                className="w-full h-auto max-h-[80vh] object-contain rounded"
                                muted
                              />
                            ) : (
                              <Image
                                src={getFileUrl(post.media[currentMediaIndex - 1].uri) || ''}
                                alt={`Post media ${currentMediaIndex}`}
                                width={1200}
                                height={800}
                                className="w-full h-auto max-h-[80vh] object-contain rounded pointer-events-none select-none"
                                draggable={false}
                              />
                            )}
                          </div>
                        )}

                        {/* Current slide */}
                        <div 
                          className={`${isTransitioning ? 'transition-transform duration-300 ease-out' : ''}`}
                          style={{
                            transform: `translateX(${swipeOffset}px)`,
                          }}
                        >
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
                              className="w-full h-auto max-h-[80vh] object-contain rounded pointer-events-none select-none"
                              draggable={false}
                            />
                          )}
                        </div>

                        {/* Next slide - absolutely positioned to the right */}
                        {currentMediaIndex < post.media.length - 1 && (
                          <div 
                            className={`absolute top-0 left-full w-full h-full flex items-center justify-center ${isTransitioning ? 'transition-transform duration-300 ease-out' : ''}`}
                            style={{
                              transform: `translateX(${swipeOffset}px)`,
                            }}
                          >
                            {getMediaType(post.media[currentMediaIndex + 1]) === 'video' ? (
                              <video
                                src={getFileUrl(post.media[currentMediaIndex + 1].uri) || ''}
                                className="w-full h-auto max-h-[80vh] object-contain rounded"
                                muted
                              />
                            ) : (
                              <Image
                                src={getFileUrl(post.media[currentMediaIndex + 1].uri) || ''}
                                alt={`Post media ${currentMediaIndex + 2}`}
                                width={1200}
                                height={800}
                                className="w-full h-auto max-h-[80vh] object-contain rounded pointer-events-none select-none"
                                draggable={false}
                              />
                            )}
                          </div>
                        )}

                        {/* Carousel Navigation - hidden on touch devices, visible on desktop */}
                        {post.media.length > 1 && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white hidden md:flex z-10"
                              onClick={prevMedia}
                              disabled={currentMediaIndex === 0}
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white hidden md:flex z-10"
                              onClick={nextMedia}
                              disabled={currentMediaIndex === post.media.length - 1}
                            >
                              <ChevronRight className="w-4 h-4" />
                            </Button>

                            {/* Carousel indicators */}
                            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1.5 z-10">
                              {post.media.map((_, mediaIndex) => (
                                <button
                                  key={mediaIndex}
                                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                                    mediaIndex === currentMediaIndex 
                                      ? 'bg-white scale-110' 
                                      : 'bg-white/50 hover:bg-white/70'
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
                    {postTitle && (
                      <div className="mb-3">
                        <p className="text-white text-sm leading-relaxed">{decodeEmoji(postTitle)}</p>
                      </div>
                    )}

                    {/* Post Date - use fallback timestamp */}
                    <div className="text-white/70 text-xs">
                      {formatDate(postTimestamp)}
                    </div>
                  </div>
                </div>
              )
            })()}
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
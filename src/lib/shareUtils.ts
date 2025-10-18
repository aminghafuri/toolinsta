/**
 * Utility functions for sharing media files
 */

export interface ShareOptions {
  title?: string
  text?: string
  url?: string
  files?: File[]
}

export interface WebShareData {
  title?: string
  text?: string
  url?: string
  files?: File[]
}

/**
 * Check if the Web Share API is available
 */
export const isWebShareSupported = (): boolean => {
  return typeof navigator !== 'undefined' && 'share' in navigator
}

/**
 * Check if the Web Share API supports files
 */
export const isWebShareFilesSupported = (): boolean => {
  return isWebShareSupported() && 'canShare' in navigator && 
    typeof navigator.canShare === 'function'
}

/**
 * Convert a blob URL to a File object for sharing
 */
export const urlToFile = async (url: string, filename: string, mimeType: string): Promise<File> => {
  const response = await fetch(url)
  const blob = await response.blob()
  return new File([blob], filename, { type: mimeType })
}

/**
 * Share using the Web Share API with files support
 */
export const shareWithWebAPI = async (options: ShareOptions): Promise<boolean> => {
  if (!isWebShareSupported()) {
    return false
  }

  try {
    const shareData: WebShareData = {
      title: options.title,
      text: options.text,
      url: options.url
    }

    // Add files if supported and available
    if (options.files && isWebShareFilesSupported()) {
      const canShareFiles = await navigator.canShare({ files: options.files })
      if (canShareFiles) {
        shareData.files = options.files
      }
    }

    await navigator.share(shareData)
    return true
  } catch (error) {
    console.error('Web Share API failed:', error)
    return false
  }
}

/**
 * Fallback share methods when Web Share API is not available
 */
export const shareWithFallback = async (options: ShareOptions): Promise<void> => {
  const { title, text, url } = options

  // Create a shareable text
  let shareText = ''
  if (title) shareText += `${title}\n\n`
  if (text) shareText += `${text}\n\n`
  if (url) shareText += url

  // Try to copy to clipboard
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(shareText)
      // You might want to show a toast notification here
      console.log('Content copied to clipboard')
      return
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }

  // Fallback: show share text in a prompt
  prompt('Share this content:', shareText)
}

/**
 * Main share function that tries Web Share API first, then fallback
 */
export const shareContent = async (options: ShareOptions): Promise<void> => {
  const success = await shareWithWebAPI(options)
  
  if (!success) {
    await shareWithFallback(options)
  }
}

/**
 * Share a media file (image or video)
 */
export const shareMedia = async (
  mediaUrl: string, 
  mediaType: 'image' | 'video',
  title?: string,
  text?: string
): Promise<void> => {
  try {
    // Determine MIME type based on media type
    const mimeType = mediaType === 'video' ? 'video/mp4' : 'image/jpeg'
    const fileExtension = mediaType === 'video' ? 'mp4' : 'jpg'
    
    // Create filename
    const filename = `instagram_${mediaType}_${Date.now()}.${fileExtension}`
    
    // Convert URL to File
    const file = await urlToFile(mediaUrl, filename, mimeType)
    
    // Share with Web Share API
    const success = await shareWithWebAPI({
      title: title || `Instagram ${mediaType}`,
      text: text || `Check out this ${mediaType} from Instagram`,
      files: [file]
    })
    
    if (!success) {
      // Fallback: share the URL
      await shareWithFallback({
        title: title || `Instagram ${mediaType}`,
        text: text || `Check out this ${mediaType} from Instagram`,
        url: mediaUrl
      })
    }
  } catch (error) {
    console.error('Failed to share media:', error)
    // Final fallback: just share the URL
    await shareWithFallback({
      title: title || `Instagram ${mediaType}`,
      text: text || `Check out this ${mediaType} from Instagram`,
      url: mediaUrl
    })
  }
}

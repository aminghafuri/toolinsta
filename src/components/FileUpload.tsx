"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, File, AlertCircle, CheckCircle } from "lucide-react"
import { extractInstagramZip } from "@/lib/zipExtractor"
import { ZipExtractionResult } from "@/types/instagram"
import { extractEssentialConnectionsData, saveEssentialConnectionsData } from "@/lib/essentialStorage"

interface FileUploadProps {
  onDataExtracted: (data: ZipExtractionResult) => void
}

const FileUpload = ({ onDataExtracted }: FileUploadProps) => {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      await processFile(file)
    }
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      await processFile(file)
    }
  }

  const processFile = async (file: File) => {
    // Validate file type
    if (!file.name.toLowerCase().endsWith('.zip')) {
      setError('Please select a valid ZIP file.')
      return
    }

    // Validate file size (max 1GB)
    if (file.size > 1024 * 1024 * 1024) {
      setError('File size too large. Please select a file smaller than 1GB.')
      return
    }

    setIsUploading(true)
    setError(null)
    setSuccess(false)
    setUploadProgress(0)

    try {
      // Use real progress updates from the extraction process
      const handleProgress = (progress: number) => {
        setUploadProgress(progress);
      };

      const result = await extractInstagramZip(file, handleProgress);

      setUploadProgress(100);
      setSuccess(true);

      // Store only essential connections data to avoid quota exceeded error
      const essentialData = extractEssentialConnectionsData(result);
      saveEssentialConnectionsData(essentialData);

      // Call the callback with extracted data
      onDataExtracted(result);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to extract Instagram data');
    } finally {
      setIsUploading(false);
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="w-full space-y-6">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleButtonClick}
        className={`
          relative group cursor-pointer
          border-2 border-dashed rounded-3xl p-8 sm:p-12
          transition-all duration-300 ease-in-out
          flex flex-col items-center justify-center text-center
          ${isDragging
            ? "border-pink-500 bg-pink-500/5 scale-[1.02]"
            : "border-border hover:border-pink-500/50 hover:bg-muted/50"
          }
          ${isUploading ? "pointer-events-none opacity-80" : ""}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".zip"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className={`
          w-16 h-16 rounded-2xl flex items-center justify-center mb-6
          transition-all duration-500
          ${isDragging ? "bg-pink-500 text-white rotate-12 scale-110" : "bg-muted text-muted-foreground group-hover:bg-pink-500/10 group-hover:text-pink-600"}
        `}>
          {isUploading ? (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current" />
          ) : (
            <Upload className="w-8 h-8" />
          )}
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-semibold tracking-tight">
            {isUploading ? "Analyzing Data..." : "Drop your ZIP here"}
          </h3>
          <p className="text-muted-foreground max-w-xs mx-auto text-sm leading-relaxed">
            {isUploading
              ? "We're processing your file locally in your browser. This may take a moment."
              : "Drag and drop your Instagram export file or click to choose from your computer."
            }
          </p>
        </div>
      </div>

      {isUploading && (
        <div className="space-y-3 px-2">
          <div className="flex justify-between text-sm font-medium">
            <span className="text-pink-600 dark:text-pink-400">Extracting data...</span>
            <span>{Math.round(uploadProgress)}%</span>
          </div>
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-pink-500 to-purple-600 transition-all duration-300 ease-out"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="bg-destructive/5 border-destructive/20 animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20 animate-in fade-in slide-in-from-top-2">
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-800 dark:text-green-200 font-medium">
            Success! Your data is ready to explore.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground font-medium uppercase tracking-wider">
        <div className="flex items-center gap-1.5">
          <File className="w-3.5 h-3.5" />
          ZIP Only
        </div>
        <div className="w-1 h-1 rounded-full bg-border" />
        <div>Max 1GB</div>
      </div>
    </div>
  )
}

export default FileUpload

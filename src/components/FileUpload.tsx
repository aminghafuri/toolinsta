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
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

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
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + Math.random() * 10
        })
      }, 200)

      const result = await extractInstagramZip(file)
      
      clearInterval(progressInterval)
      setUploadProgress(100)
      setSuccess(true)
      
      // Store only essential connections data to avoid quota exceeded error
      const essentialData = extractEssentialConnectionsData(result)
      saveEssentialConnectionsData(essentialData)
      
      // Call the callback with extracted data
      onDataExtracted(result)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to extract Instagram data')
    } finally {
      setIsUploading(false)
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-2xl">
          <Upload className="h-6 w-6" />
          Upload Instagram Data
        </CardTitle>
        <CardDescription>
          Select your Instagram data export ZIP file to get started
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Button
            onClick={handleButtonClick}
            disabled={isUploading}
            size="lg"
            className="w-full h-16 text-lg"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                Processing...
              </>
            ) : (
              <>
                <File className="h-5 w-5 mr-2" />
                Choose ZIP File
              </>
            )}
          </Button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".zip"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {isUploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Extracting data...</span>
              <span>{Math.round(uploadProgress)}%</span>
            </div>
            <Progress value={uploadProgress} className="w-full" />
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              Instagram data extracted successfully! You can now explore your data.
            </AlertDescription>
          </Alert>
        )}

        <div className="text-center text-sm text-muted-foreground">
          <p>Supported formats: Instagram data export ZIP files</p>
          <p>Maximum file size: 1GB</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default FileUpload

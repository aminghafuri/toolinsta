"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { HelpCircle, Download, FileText, Smartphone, Settings, ChevronLeft, ChevronRight } from "lucide-react"

interface InstructionsModalProps {
  children: React.ReactNode
}

const steps = [
  {
    id: 1,
    title: "Access Instagram Settings",
    icon: <Smartphone className="h-5 w-5" />,
    description: "Open the Instagram app on your mobile device or visit instagram.com on your computer.",
    instructions: [
      "Tap your profile picture in the bottom right (mobile) or top right (web)",
      "Tap the three lines menu (☰) in the top right",
      "Select \"Accounts Center\""
    ]
  },
  {
    id: 2,
    title: "Request Your Data",
    icon: <Settings className="h-5 w-5" />,
    description: "Navigate to the data download section:",
    instructions: [
      "Scroll down and tap \"Your information and permissions\"",
      "Select \"Export your information\"",
      "Choose \"Create a export\"",
      "Choose the account you want to export",
      "Select \"Export to device\"",
      "You can customize your information and Date range",
      "Choose your \"Format\" to (JSON)",
      "Choose \"Media quality\" (Lower quality recommended)",
      "Tap \"Start export\""
    ]
  },
  {
    id: 3,
    title: "Download Your Data",
    icon: <Download className="h-5 w-5" />,
    description: "Instagram will process your request and send you a download link:",
    instructions: [
      "Check your email for a message from Instagram",
      "Click the download link in the email",
      "Download the ZIP file to your device",
      "The file will be named something like \"instagram-username.zip\""
    ]
  },
  {
    id: 4,
    title: "Upload to This Tool",
    icon: <FileText className="h-5 w-5" />,
    description: "Once you have your Instagram data ZIP file:",
    instructions: [
      "Click the \"Upload Instagram Data\" button below",
      "Select your downloaded ZIP file",
      "Wait for the extraction to complete",
      "Explore your Instagram data in a beautiful, organized format!"
    ]
  }
]

const InstructionsModal = ({ children }: InstructionsModalProps) => {
  const [currentStep, setCurrentStep] = useState(1)
  const currentStepData = steps.find(step => step.id === currentStep)

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleStepClick = (stepId: number) => {
    setCurrentStep(stepId)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl h-[70vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <HelpCircle className="h-6 w-6" />
            How to Export Your Instagram Data
          </DialogTitle>
          <DialogDescription>
            Follow these steps to download your Instagram data and upload it to this tool.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Current Step Card */}
          <Card className="min-h-[40vh]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {currentStepData?.icon}
                Step {currentStep}: {currentStepData?.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                {currentStepData?.description}
              </p>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                {currentStepData?.instructions.map((instruction, index) => (
                  <li key={index} className="text-sm">
                    {instruction}
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>



          {/* Important Notes - Only show on last step */}
          {currentStep === steps.length && (
            <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800 flex-shrink-0">
              <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">⚠️ Important Instagram Export Limitations:</h4>
              <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
                <li>• Instagram may take up to 30 days to prepare your data</li>
                <li>• The download link expires after 4 days</li>
                <li>• Your data is processed locally in your browser - nothing is sent to our servers</li>
                <li>• This tool works with the standard Instagram data export format</li>
                <li>• <strong>Instagram&apos;s export system has known issues with followers data</strong></li>
                <li>• <strong>Followers list is often incomplete - Instagram misses certain date ranges</strong></li>
                <li>• Following data is usually complete and accurate</li>
                <li>• This is a limitation of Instagram&apos;s export system, not this tool</li>
                <li>• The unfollowers calculation uses smart date filtering to improve accuracy</li>
              </ul>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center flex-shrink-0 gap-2 mt-4 pt-2 border-t">
          <Button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Previous</span>
          </Button>

          {/* Step Indicator */}
          <div className="flex justify-center space-x-1 sm:space-x-2">
            {steps.map((step) => (
              <button
                key={step.id}
                onClick={() => handleStepClick(step.id)}
                className={`w-8 h-8 rounded-full text-sm font-medium transition-all duration-200 flex items-center justify-center ${step.id === currentStep
                  ? "bg-primary text-primary-foreground scale-110"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
              >
                {step.id}
              </button>
            ))}
          </div>

          <Button
            onClick={handleNext}
            disabled={currentStep === steps.length}
            className="flex items-center gap-2"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>


      </DialogContent>
    </Dialog>
  )
}

export default InstructionsModal

"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, X, Play } from "lucide-react"

interface TutorialOverlayProps {
  onClose: () => void
}

const tutorialSteps = [
  {
    title: "Welcome to Geospatial Dashboard",
    content:
      "This interactive dashboard allows you to analyze weather data across custom geographic regions. Let's take a quick tour!",
    highlight: null,
  },
  {
    title: "Drawing Polygons",
    content:
      "Click 'Draw New Polygon' to start creating analysis regions. Click points on the map to define your area (3-12 points).",
    highlight: "polygon-tools",
  },
  {
    title: "Timeline Control",
    content:
      "Use the timeline slider to navigate through time and see how weather patterns change. You can play, pause, and adjust speed.",
    highlight: "timeline",
  },
  {
    title: "Data Sources",
    content: "Switch between different weather parameters like temperature, humidity, precipitation, and wind speed.",
    highlight: "data-sources",
  },
  {
    title: "Live Statistics",
    content: "Monitor real-time averages across all your polygons in the stats panel at the top.",
    highlight: "stats",
  },
]

export function TutorialOverlay({ onClose }: TutorialOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0)

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onClose()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-white shadow-2xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Play className="h-5 w-5 text-blue-500" />
              <span>Interactive Tutorial</span>
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex space-x-1 mt-2">
            {tutorialSteps.map((_, index) => (
              <div
                key={index}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  index <= currentStep ? "bg-blue-500" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">{tutorialSteps[currentStep].title}</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{tutorialSteps[currentStep].content}</p>
          </div>

          <div className="flex items-center justify-between pt-4">
            <Button variant="outline" size="sm" onClick={prevStep} disabled={currentStep === 0}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>

            <span className="text-sm text-gray-500">
              {currentStep + 1} of {tutorialSteps.length}
            </span>

            <Button size="sm" onClick={nextStep}>
              {currentStep === tutorialSteps.length - 1 ? "Finish" : "Next"}
              {currentStep !== tutorialSteps.length - 1 && <ChevronRight className="h-4 w-4 ml-1" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Play, Pause, SkipBack, SkipForward, Clock, Calendar } from "lucide-react"
import type { TimeRange } from "@/types"

interface TimelineSliderProps {
  timeRange: TimeRange
  onTimeRangeChange: (range: TimeRange) => void
  currentTime: Date
  onCurrentTimeChange: (time: Date | ((prev: Date) => Date)) => void
  isDarkMode: boolean
}

export function TimelineSlider({
  timeRange,
  onTimeRangeChange,
  currentTime,
  onCurrentTimeChange,
  isDarkMode,
}: TimelineSliderProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1000)

  const totalHours = Math.floor(
    (timeRange.end.getTime() - timeRange.start.getTime()) / (1000 * 60 * 60)
  )

  const currentHour = Math.max(
    0,
    Math.min(
      totalHours - 1,
      Math.floor((currentTime.getTime() - timeRange.start.getTime()) / (1000 * 60 * 60))
    )
  )

  const progress = useMemo(() => {
    return totalHours > 1 ? (currentHour / (totalHours - 1)) * 100 : 0
  }, [currentHour, totalHours])

  // Memoized tick function
  const tick = useCallback(() => {
    onCurrentTimeChange((prev) => {
      const next = new Date(prev.getTime() + 60 * 60 * 1000)
      if (next > timeRange.end) {
        setIsPlaying(false)
        return timeRange.end
      }
      return next
    })
  }, [onCurrentTimeChange, timeRange.end])

  useEffect(() => {
    if (!isPlaying) return
    const interval = setInterval(tick, playbackSpeed)
    return () => clearInterval(interval)
  }, [isPlaying, playbackSpeed, tick])

  const handleSliderChange = (values: number[]) => {
    const newTime = new Date(timeRange.start.getTime() + values[0] * 60 * 60 * 1000)
    onCurrentTimeChange(newTime)
  }

  const formatDateTime = (date: Date) =>
    date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })

  const formatDateOnly = (date: Date) =>
    date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })

  return (
    <Card
      className={`border-0 shadow-lg ${
        isDarkMode
          ? "bg-gradient-to-r from-gray-800 to-gray-700 text-white"
          : "bg-gradient-to-r from-white to-blue-50/50"
      }`}
    >
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Current Time Display */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center space-x-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {formatDateTime(currentTime)}
              </div>
            </div>
            <div className="flex items-center justify-center space-x-4 text-sm">
              <div className={`flex items-center space-x-1 ${isDarkMode ? "text-gray-300" : "text-gray-500"}`}>
                <Calendar className="h-4 w-4" />
                <span>{formatDateOnly(currentTime)}</span>
              </div>
              <div className="w-1 h-1 bg-gray-300 rounded-full" />
              <span className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-500"}`}>
                Hour {currentHour + 1} of {totalHours}
              </span>
              <div className="w-1 h-1 bg-gray-300 rounded-full" />
              <span className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-500"}`}>
                {progress.toFixed(1)}% Complete
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Main Timeline Slider */}
          <div className="space-y-3">
            <div className={`flex items-center justify-between text-sm ${isDarkMode ? "text-gray-300" : "text-gray-500"}`}>
              <span className="font-medium">{formatDateTime(timeRange.start)}</span>
              <span className="font-medium">{formatDateTime(timeRange.end)}</span>
            </div>
            <Slider
              value={[currentHour]}
              onValueChange={handleSliderChange}
              max={totalHours - 1}
              step={1}
              className="w-full"
            />
          </div>

          {/* Playback Controls */}
          <div className="flex items-center justify-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCurrentTimeChange(timeRange.start)}
              disabled={currentTime <= timeRange.start}
              className="transition-all duration-200 hover:scale-105"
            >
              <SkipBack className="h-4 w-4" />
            </Button>

            <Button
              size="sm"
              onClick={() => setIsPlaying(!isPlaying)}
              disabled={currentTime >= timeRange.end}
              className="transition-all duration-200 hover:scale-105 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onCurrentTimeChange(timeRange.end)}
              disabled={currentTime >= timeRange.end}
              className="transition-all duration-200 hover:scale-105"
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>

          {/* Speed Control */}
          <div className="flex items-center justify-center space-x-2">
            <span className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-500"} font-medium`}>
              Playback Speed:
            </span>
            <div className="flex space-x-1">
              {[0.5, 1, 2, 4].map((speed) => {
                const speedMs = 1000 / speed
                return (
                  <Button
                    key={speed}
                    variant={Math.abs(playbackSpeed - speedMs) < 1 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPlaybackSpeed(speedMs)}
                    className="transition-all duration-200 hover:scale-105 min-w-[3rem]"
                  >
                    {speed}x
                  </Button>
                )
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

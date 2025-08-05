"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Map, BarChart3, Menu, X, Activity, Moon, Sun, Maximize, Minimize, HelpCircle, Download } from "lucide-react"

interface HeaderProps {
  polygonCount: number
  isLoading: boolean
  onSidebarToggle: () => void
  sidebarCollapsed: boolean
  isDarkMode: boolean
  onDarkModeToggle: () => void
  onFullscreenToggle: () => void
  isFullscreen: boolean
  onTutorialStart: () => void
  onExportData: () => void
}

export function Header({
  polygonCount,
  isLoading,
  onSidebarToggle,
  sidebarCollapsed,
  isDarkMode,
  onDarkModeToggle,
  onFullscreenToggle,
  isFullscreen,
  onTutorialStart,
  onExportData,
}: HeaderProps) {
  return (
    <div
      className={`${isDarkMode ? "bg-gray-800/90" : "bg-white/90"} backdrop-blur-md border-b ${
        isDarkMode ? "border-gray-700/50" : "border-gray-200/50"
      } shadow-lg transition-all duration-300`}
    >
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg animate-pulse-glow">
                <Map className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1
                  className={`text-2xl font-bold bg-gradient-to-r ${
                    isDarkMode ? "from-blue-400 to-purple-400" : "from-gray-900 to-gray-600"
                  } bg-clip-text text-transparent`}
                >
                  Geospatial Weather Dashboard
                </h1>
                <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"} mt-1`}>
                  Advanced Interactive Weather Analysis Platform
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Status Indicators */}
            <div className="flex items-center space-x-3">
              <Badge
                variant="secondary"
                className={`flex items-center space-x-1 ${
                  isDarkMode ? "bg-gray-700 text-gray-200" : ""
                } animate-in fade-in duration-300`}
              >
                <BarChart3 className="h-3 w-3" />
                <span>{polygonCount} Regions</span>
              </Badge>

              {isLoading && (
                <Badge
                  variant="outline"
                  className="flex items-center space-x-1 animate-pulse border-blue-300 text-blue-600"
                >
                  <Activity className="h-3 w-3" />
                  <span>Analyzing</span>
                </Badge>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onTutorialStart}
                className="transition-all duration-200 hover:scale-105"
              >
                <HelpCircle className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={onExportData}
                className="transition-all duration-200 hover:scale-105"
              >
                <Download className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={onDarkModeToggle}
                className="transition-all duration-200 hover:scale-105"
              >
                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={onFullscreenToggle}
                className="transition-all duration-200 hover:scale-105"
              >
                {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={onSidebarToggle}
                className="transition-all duration-200 hover:scale-105 bg-transparent"
              >
                {sidebarCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

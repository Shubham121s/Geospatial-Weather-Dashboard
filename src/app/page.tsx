"use client"

import { useState, useEffect, useCallback } from "react"
import dynamic from "next/dynamic"
import { TimelineSlider } from "@/components/timeline-slider"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { LoadingSpinner } from "@/components/loading-spinner"
import { StatsPanel } from "@/components/stats-panel"
import { NotificationSystem } from "@/components/notification-system"
import { TutorialOverlay } from "@/components/tutorial-overlay"
import type { Polygon, DataSource, TimeRange, Notification } from "@/types"
import { fetchWeatherData } from "@/lib/api"



const MapComponent = dynamic(() => import("@/components/map-component"), {
  ssr: false,
  loading: () => <LoadingSpinner />,
})

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState<TimeRange>({
    start: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    end: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
  })

  const [currentTime, setCurrentTime] = useState<Date>(new Date())
  const [polygons, setPolygons] = useState<Polygon[]>([])
  const [dataSources, setDataSources] = useState<DataSource[]>([
    {
      id: "temperature",
      name: "Temperature",
      field: "temperature_2m",
      color: "#ff6b6b",
      thresholds: [
        { operator: "<", value: 10, color: "#3b82f6" },
        { operator: ">=", value: 10, operator2: "<", value2: 25, color: "#10b981" },
        { operator: ">=", value: 25, color: "#ef4444" },
      ],
    },
    {
      id: "humidity",
      name: "Humidity",
      field: "relative_humidity_2m",
      color: "#06b6d4",
      thresholds: [
        { operator: "<", value: 40, color: "#f59e0b" },
        { operator: ">=", value: 40, operator2: "<", value2: 70, color: "#10b981" },
        { operator: ">=", value: 70, color: "#3b82f6" },
      ],
    },
    {
      id: "precipitation",
      name: "Precipitation",
      field: "precipitation",
      color: "#8b5cf6",
      thresholds: [
        { operator: "<", value: 0.1, color: "#f3f4f6" },
        { operator: ">=", value: 0.1, operator2: "<", value2: 2, color: "#60a5fa" },
        { operator: ">=", value: 2, color: "#1d4ed8" },
      ],
    },
    {
      id: "wind_speed",
      name: "Wind Speed",
      field: "wind_speed_10m",
      color: "#f59e0b",
      thresholds: [
        { operator: "<", value: 5, color: "#10b981" },
        { operator: ">=", value: 5, operator2: "<", value2: 15, color: "#f59e0b" },
        { operator: ">=", value: 15, color: "#ef4444" },
      ],
    },
  ])
  
  const [selectedDataSource, setSelectedDataSource] = useState<string>("temperature")
  const [isDrawing, setIsDrawing] = useState(false)
  const [weatherData, setWeatherData] = useState<any>({})
  const [isLoading, setIsLoading] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showTutorial, setShowTutorial] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    setCurrentTime(timeRange.start)
  }, [timeRange])

  const addNotification = (notification: Omit<Notification, "id" | "timestamp">) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
    }
    setNotifications((prev) => [newNotification, ...prev.slice(0, 4)])

    // Auto remove after 5 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== newNotification.id))
    }, 5000)
  }

  const updateWeatherData = useCallback(async () => {
    if (polygons.length === 0) return

    setIsLoading(true)
    const newWeatherData: any = {}

    try {
      for (const polygon of polygons) {
        if (polygon.center) {
          const data = await fetchWeatherData(polygon.center.lat, polygon.center.lng, timeRange.start, timeRange.end)
          newWeatherData[polygon.id] = data
        }
      }
      setWeatherData(newWeatherData)
      addNotification({
        type: "success",
        title: "Data Updated",
        message: `Weather data refreshed for ${polygons.length} polygon(s)`,
      })
    } catch (error) {
      console.error("Failed to fetch weather data:", error)
      addNotification({
        type: "error",
        title: "Data Error",
        message: "Failed to fetch weather data",
      })
    } finally {
      setIsLoading(false)
    }
  }, [polygons, timeRange])

  useEffect(() => {
    updateWeatherData()
  }, [updateWeatherData])

  const handlePolygonCreate = (polygon: Polygon) => {
    setPolygons((prev) => [...prev, { ...polygon, dataSourceId: selectedDataSource }])
    addNotification({
      type: "success",
      title: "Polygon Created",
      message: `New polygon added with ${polygon.coordinates.length} points`,
    })
  }

  const handlePolygonDelete = (polygonId: string) => {
    setPolygons((prev) => prev.filter((p) => p.id !== polygonId))
    addNotification({
      type: "info",
      title: "Polygon Deleted",
      message: "Polygon removed from analysis",
    })
  }

  const handlePolygonUpdate = (polygonId: string, updates: Partial<Polygon>) => {
    setPolygons((prev) => prev.map((p) => (p.id === polygonId ? { ...p, ...updates } : p)))
  }

  const getPolygonColor = (polygon: Polygon, currentTime: Date): string => {
    const dataSource = dataSources.find((ds) => ds.id === polygon.dataSourceId)
    if (!dataSource || !weatherData[polygon.id]) return dataSource?.color || "#6b7280"

    const data = weatherData[polygon.id]
    const hourIndex = Math.floor((currentTime.getTime() - timeRange.start.getTime()) / (1000 * 60 * 60))

    if (!data.hourly || !data.hourly[dataSource.field] || !data.hourly[dataSource.field][hourIndex]) {
      return dataSource.color
    }

    const value = data.hourly[dataSource.field][hourIndex]

    for (const threshold of dataSource.thresholds) {
      if (threshold.operator === "<" && value < threshold.value) {
        return threshold.color
      } else if (threshold.operator === ">=" && threshold.value2 !== undefined) {
        if (value >= threshold.value && value < threshold.value2) {
          return threshold.color
        }
      } else if (threshold.operator === ">=" && threshold.value2 === undefined && value >= threshold.value) {
        return threshold.color
      }
    }

    return dataSource.color
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const exportData = () => {
    const exportData = {
      polygons,
      dataSources,
      timeRange,
      currentTime,
      weatherData,
    }

    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `geospatial-data-${new Date().toISOString().split("T")[0]}.json`
    link.click()

    addNotification({
      type: "success",
      title: "Data Exported",
      message: "Project data exported successfully",
    })
  }

  return (
    <div
      className={`h-screen flex flex-col transition-all duration-500 ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900"
          : "bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50"
      }`}
    >
      {/* Tutorial Overlay */}
      {showTutorial && <TutorialOverlay onClose={() => setShowTutorial(false)} />}

      {/* Notification System */}
      <NotificationSystem notifications={notifications} />

      {/* Header */}
      <Header
        polygonCount={polygons.length}
        isLoading={isLoading}
        onSidebarToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        sidebarCollapsed={sidebarCollapsed}
        isDarkMode={isDarkMode}
        onDarkModeToggle={() => setIsDarkMode(!isDarkMode)}
        onFullscreenToggle={toggleFullscreen}
        isFullscreen={isFullscreen}
        onTutorialStart={() => setShowTutorial(true)}
        onExportData={exportData}
      />

      {/* Stats Panel */}
      <StatsPanel
        polygons={polygons}
        weatherData={weatherData}
        currentTime={currentTime}
        dataSources={dataSources}
        isDarkMode={isDarkMode}
      />

      {/* Timeline Slider */}
      <div
        className={`${isDarkMode ? "bg-gray-800/80" : "bg-white/80"} backdrop-blur-sm border-b ${
          isDarkMode ? "border-gray-700/50" : "border-gray-200/50"
        } p-6 shadow-sm transition-all duration-300`}
      >
        <TimelineSlider
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
          currentTime={currentTime}
          onCurrentTimeChange={setCurrentTime}
          isDarkMode={isDarkMode}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Map */}
        <div className="flex-1 relative">
          <MapComponent
            polygons={polygons}
            onPolygonCreate={handlePolygonCreate}
            onPolygonDelete={handlePolygonDelete}
            onPolygonUpdate={handlePolygonUpdate}
            isDrawing={isDrawing}
            onDrawingChange={setIsDrawing}
            getPolygonColor={getPolygonColor}
            currentTime={currentTime}
            isDarkMode={isDarkMode}
          />
        </div>

        {/* Sidebar */}
        <div
          className={`transition-all duration-500 ease-in-out ${
            sidebarCollapsed ? "w-0" : "w-96"
          } ${isDarkMode ? "bg-gray-800/95" : "bg-white/95"} backdrop-blur-sm border-l ${
            isDarkMode ? "border-gray-700/50" : "border-gray-200/50"
          } shadow-2xl`}
        >
          <div
            className={`h-full overflow-hidden ${
              sidebarCollapsed ? "opacity-0" : "opacity-100"
            } transition-opacity duration-300`}
          >
            <Sidebar
              dataSources={dataSources}
              selectedDataSource={selectedDataSource}
              onDataSourceSelect={setSelectedDataSource}
              onDataSourceUpdate={(id, updates) => {
                setDataSources((prev) => prev.map((ds) => (ds.id === id ? { ...ds, ...updates } : ds)))
              }}
              polygons={polygons}
              onPolygonDelete={handlePolygonDelete}
              isDrawing={isDrawing}
              onDrawingToggle={() => setIsDrawing(!isDrawing)}
              weatherData={weatherData}
              currentTime={currentTime}
              isLoading={isLoading}
              isDarkMode={isDarkMode}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

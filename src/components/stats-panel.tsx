"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Activity, Thermometer, Droplets, Wind, Cloud } from "lucide-react"
import type { Polygon, DataSource } from "@/types"

interface StatsPanelProps {
  polygons: Polygon[]
  weatherData: Record<string, any>
  currentTime: Date
  dataSources: DataSource[]
  isDarkMode: boolean
}

export function StatsPanel({
  polygons,
  weatherData,
  currentTime,
  dataSources,
  isDarkMode,
}: StatsPanelProps) {
  const getAverageValue = (field: string) => {
    let total = 0
    let count = 0

    polygons.forEach((polygon) => {
      const data = weatherData[polygon.id]
      if (!data || !data.hourly || !data.hourly[field] || !data.hourly.time) return

      const timeArray = data.hourly.time.map((t: string) => new Date(t).getTime())
      const hourIndex = timeArray.findIndex((t) => t >= currentTime.getTime())

      if (hourIndex !== -1 && hourIndex < data.hourly[field].length) {
        const value = data.hourly[field][hourIndex]
        if (typeof value === "number") {
          total += value
          count++
        }
      }
    })

    return count > 0 ? total / count : null
  }

  const getIcon = (field: string) => {
    switch (field) {
      case "temperature_2m":
        return <Thermometer className="h-4 w-4" />
      case "relative_humidity_2m":
        return <Droplets className="h-4 w-4" />
      case "precipitation":
        return <Cloud className="h-4 w-4" />
      case "wind_speed_10m":
        return <Wind className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getUnit = (field: string) => {
    switch (field) {
      case "temperature_2m":
        return "°C"
      case "relative_humidity_2m":
        return "%"
      case "precipitation":
        return "mm"
      case "wind_speed_10m":
        return "km/h"
      default:
        return ""
    }
  }

  if (polygons.length === 0) return null

  return (
    <div
      className={`${isDarkMode ? "bg-gray-800/50" : "bg-white/50"} backdrop-blur-sm border-b ${
        isDarkMode ? "border-gray-700/50" : "border-gray-200/50"
      } p-4 transition-all duration-300`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3
          className={`text-sm font-semibold ${isDarkMode ? "text-gray-200" : "text-gray-700"} flex items-center space-x-2`}
        >
          <Activity className="h-4 w-4" />
          <span>Live Weather Statistics</span>
        </h3>
        <Badge variant="outline" className="animate-pulse">
          {polygons.length} Active Region{polygons.length > 1 ? "s" : ""}
        </Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {dataSources.map((source) => {
          const avgValue = getAverageValue(source.field)
          const isNumeric = typeof avgValue === "number"

          return (
            <Card
              key={source.id}
              className={`${
                isDarkMode ? "bg-gray-700/50 border-gray-600" : "bg-white/70 border-gray-200"
              } backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-lg`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className={`p-2 rounded-lg ${isDarkMode ? "bg-gray-600" : "bg-gray-100"}`}>
                      {getIcon(source.field)}
                    </div>
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: source.color }} />
                  </div>
                  {isNumeric && (
                    <TrendingUp className={`h-4 w-4 ${isDarkMode ? "text-green-400" : "text-green-500"}`} />
                  )}
                </div>

                <div className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"} mb-1`}>
                  {isNumeric ? avgValue.toFixed(1) + getUnit(source.field) : "N/A"}
                </div>

                <div className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                  Avg {source.name}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

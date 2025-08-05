"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Trash2, Edit3, Plus, Thermometer, Droplets, Cloud, Activity, TrendingUp } from "lucide-react"
import type { DataSource, Polygon } from "@/types"

interface SidebarProps {
  dataSources: DataSource[]
  selectedDataSource: string
  onDataSourceSelect: (id: string) => void
  onDataSourceUpdate: (id: string, updates: Partial<DataSource>) => void
  polygons: Polygon[]
  onPolygonDelete: (id: string) => void
  isDrawing: boolean
  onDrawingToggle: () => void
  weatherData: any
  currentTime: Date
  isLoading: boolean
  isDarkMode: boolean
}

const getDataSourceIcon = (id: string) => {
  switch (id) {
    case "temperature":
      return <Thermometer className="h-4 w-4" />
    case "humidity":
      return <Droplets className="h-4 w-4" />
    case "precipitation":
      return <Cloud className="h-4 w-4" />
    default:
      return <Activity className="h-4 w-4" />
  }
}

const getDataSourceUnit = (id: string) => {
  switch (id) {
    case "temperature":
      return "°C"
    case "humidity":
      return "%"
    case "precipitation":
      return "mm"
    default:
      return ""
  }
}

export function Sidebar({
  dataSources,
  selectedDataSource,
  onDataSourceSelect,
  onDataSourceUpdate,
  polygons,
  onPolygonDelete,
  isDrawing,
  onDrawingToggle,
  weatherData,
  currentTime,
  isLoading,
  isDarkMode,
}: SidebarProps) {
  const selectedSource = dataSources.find((ds) => ds.id === selectedDataSource)

  const addThreshold = (dataSourceId: string) => {
    const dataSource = dataSources.find((ds) => ds.id === dataSourceId)
    if (dataSource) {
      const newThreshold = {
        operator: ">=" as const,
        value: 0,
        color: "#3b82f6",
      }
      onDataSourceUpdate(dataSourceId, {
        thresholds: [...dataSource.thresholds, newThreshold],
      })
    }
  }

  const updateThreshold = (dataSourceId: string, index: number, updates: any) => {
    const dataSource = dataSources.find((ds) => ds.id === dataSourceId)
    if (dataSource) {
      const newThresholds = [...dataSource.thresholds]
      newThresholds[index] = { ...newThresholds[index], ...updates }
      onDataSourceUpdate(dataSourceId, { thresholds: newThresholds })
    }
  }

  const removeThreshold = (dataSourceId: string, index: number) => {
    const dataSource = dataSources.find((ds) => ds.id === dataSourceId)
    if (dataSource) {
      const newThresholds = dataSource.thresholds.filter((_, i) => i !== index)
      onDataSourceUpdate(dataSourceId, { thresholds: newThresholds })
    }
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {/* Drawing Tools */}
      <Card className={`border-0 shadow-lg ${isDarkMode ? "bg-gradient-to-br from-gray-800 to-gray-700" : "bg-gradient-to-br from-white to-blue-50/30"}`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center space-x-2">
            <Edit3 className="h-5 w-5 text-blue-500" />
            <span>Polygon Tools</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={onDrawingToggle}
            variant={isDrawing ? "destructive" : "default"}
            className="w-full transition-all duration-200 hover:scale-105"
            size="lg"
          >
            <Edit3 className="h-4 w-4 mr-2" />
            {isDrawing ? "Cancel Drawing" : "Draw New Polygon"}
          </Button>
          <div className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"} ${isDarkMode ? "bg-gray-700" : "bg-blue-50"} p-3 rounded-lg`}>
            <p className="font-medium mb-1">Drawing Instructions:</p>
            <ul className="space-y-1 text-xs">
              <li>• Click points on the map (3-12 points)</li>
              <li>• Double-click or click near first point to complete</li>
              <li>• Press ESC to cancel drawing</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Data Source Selection */}
      <Card className={`border-0 shadow-lg ${isDarkMode ? "bg-gradient-to-br from-gray-800 to-gray-700" : "bg-gradient-to-br from-white to-purple-50/30"}`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-purple-500" />
            <span>Data Sources</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="data-source">Select Data Source</Label>
            <Select value={selectedDataSource} onValueChange={onDataSourceSelect}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {dataSources.map((source) => (
                  <SelectItem key={source.id} value={source.id}>
                    <div className="flex items-center space-x-2">
                      {getDataSourceIcon(source.id)}
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: source.color }} />
                      <span>{source.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedSource && (
            <div className="space-y-4">
              <Separator />
              <div>
                <Label>Color Rules</Label>
                <div className="space-y-3 mt-2">
                  {selectedSource.thresholds.map((threshold, index) => (
                    <div
                      key={`${selectedSource.id}-threshold-${index}`}
                      className={`p-3 border rounded-lg ${isDarkMode ? "bg-gray-700/50 hover:bg-gray-700" : "bg-gray-50/50 hover:bg-gray-50"} transition-colors`}
                    >
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: threshold.color }} />
                        <Select
                          value={threshold.operator}
                          onValueChange={(value) => updateThreshold(selectedSource.id, index, { operator: value })}
                        >
                          <SelectTrigger className="w-16 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="<">{"<"}</SelectItem>
                            <SelectItem value=">=">{">="}</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          type="number"
                          value={threshold.value ?? ""}
                          onChange={(e) => updateThreshold(selectedSource.id, index, { value: Number(e.target.value) })}
                          className="w-20 h-8"
                        />
                        {threshold.value2 !== undefined && (
                          <>
                            <span className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>and {"<"}</span>
                            <Input
                              type="number"
                              value={threshold.value2 ?? ""}
                              onChange={(e) => updateThreshold(selectedSource.id, index, { value2: Number(e.target.value) })}
                              className="w-20 h-8"
                            />
                          </>
                        )}
                        <Input
                          type="color"
                          value={threshold.color}
                          onChange={(e) => updateThreshold(selectedSource.id, index, { color: e.target.value })}
                          className="w-12 h-8 p-1"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeThreshold(selectedSource.id, index)}
                          className="h-8 w-8 p-0 hover:bg-red-50 hover:border-red-200"
                        >
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addThreshold(selectedSource.id)}
                    className="w-full transition-all duration-200 hover:scale-105"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Color Rule
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Polygon List */}
      <Card className={`border-0 shadow-lg ${isDarkMode ? "bg-gradient-to-br from-gray-800 to-gray-700" : "bg-gradient-to-br from-white to-green-50/30"}`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-green-500" />
              <span>Active Polygons</span>
            </div>
            <Badge variant="secondary">{polygons.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {polygons.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Edit3 className="h-8 w-8 text-gray-400" />
              </div>
              <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"} font-medium`}>No polygons created yet</p>
              <p className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-400"} mt-1`}>
                Click "Draw New Polygon" to get started
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {polygons.map((polygon) => {
                const dataSource = dataSources.find((ds) => ds.id === polygon.dataSourceId)
                const data = weatherData[polygon.id]
                let currentValue = isLoading ? "Loading..." : "No data"

                if (data && data.hourly && dataSource && dataSource.field && Array.isArray(data.hourly[dataSource.field])) {
                  const baseTime = new Date(data.hourly.time?.[0]).getTime()
                  const hourIndex = Math.floor((currentTime.getTime() - baseTime) / (1000 * 60 * 60))

                  if (hourIndex >= 0 && hourIndex < data.hourly[dataSource.field].length) {
                    const value = data.hourly[dataSource.field][hourIndex]
                    if (value != null) {
                      currentValue = `${value.toFixed(1)}${getDataSourceUnit(dataSource.id)}`
                    }
                  }
                }

                return (
                  <div key={polygon.id} className={`p-3 border rounded-lg ${isDarkMode ? "bg-gray-700/50 hover:bg-gray-700" : "bg-white/50 hover:bg-white/80"} transition-all duration-200 hover:shadow-md`}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-4 h-4 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: dataSource?.color || "#ccc" }} />
                          <span className="text-sm font-medium">Polygon {polygon.id.split("_")[1]}</span>
                          <Badge variant="outline" size="sm">{dataSource?.name}</Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getDataSourceIcon(dataSource?.id || "")}
                          <span className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                            Current: <span className="font-medium text-gray-900">{currentValue}</span>
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPolygonDelete(polygon.id)}
                        className="hover:bg-red-50 hover:border-red-200 transition-colors"
                      >
                        <Trash2 className="h-3 w-3 text-red-500" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

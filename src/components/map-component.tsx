"use client"

import type React from "react"
import { useEffect, useRef, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ZoomIn, ZoomOut, RotateCcw, Navigation } from "lucide-react"
import type { Polygon } from "@/types"

interface MapComponentProps {
  polygons: Polygon[]
  onPolygonCreate: (polygon: Polygon) => void
  onPolygonDelete: (polygonId: string) => void
  onPolygonUpdate: (polygonId: string, updates: Partial<Polygon>) => void
  isDrawing: boolean
  onDrawingChange: (drawing: boolean) => void
  getPolygonColor: (polygon: Polygon, currentTime: Date) => string
  currentTime: Date
  isDarkMode: boolean
}

interface Point {
  x: number
  y: number
}

interface MapState {
  centerX: number
  centerY: number
  zoom: number
}

export default function MapComponent({
  polygons,
  onPolygonCreate,
  onPolygonDelete,
  onPolygonUpdate,
  isDrawing,
  onDrawingChange,
  getPolygonColor,
  currentTime,
  isDarkMode,
}: MapComponentProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [mapState, setMapState] = useState<MapState>({ centerX: 0, centerY: 0, zoom: 1 })
  const [drawingPoints, setDrawingPoints] = useState<Point[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [lastMousePos, setLastMousePos] = useState<Point>({ x: 0, y: 0 })
  const [hoveredPolygon, setHoveredPolygon] = useState<string | null>(null)

  const screenToWorld = useCallback(
    (screenX: number, screenY: number): Point => {
      const canvas = canvasRef.current
      if (!canvas) return { x: 0, y: 0 }

      const rect = canvas.getBoundingClientRect()
      const x = (screenX - rect.left - canvas.width / 2) / mapState.zoom + mapState.centerX
      const y = (screenY - rect.top - canvas.height / 2) / mapState.zoom + mapState.centerY

      return { x, y }
    },
    [mapState],
  )

  const worldToScreen = useCallback(
    (worldX: number, worldY: number): Point => {
      const canvas = canvasRef.current
      if (!canvas) return { x: 0, y: 0 }

      const x = (worldX - mapState.centerX) * mapState.zoom + canvas.width / 2
      const y = (worldY - mapState.centerY) * mapState.zoom + canvas.height / 2

      return { x, y }
    },
    [mapState],
  )

  const drawMap = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Update background gradient for dark mode
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    if (isDarkMode) {
      gradient.addColorStop(0, "#1f2937")
      gradient.addColorStop(1, "#111827")
    } else {
      gradient.addColorStop(0, "#f0f9ff")
      gradient.addColorStop(1, "#e0f2fe")
    }
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw enhanced grid
    ctx.strokeStyle = isDarkMode ? "#4b5563" : "#e2e8f0"
    ctx.lineWidth = 1
    const gridSize = 50 * mapState.zoom
    const offsetX = (mapState.centerX * mapState.zoom) % gridSize
    const offsetY = (mapState.centerY * mapState.zoom) % gridSize

    // Major grid lines
    for (let x = -offsetX; x < canvas.width + gridSize; x += gridSize) {
      ctx.globalAlpha = 0.3
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvas.height)
      ctx.stroke()
    }

    for (let y = -offsetY; y < canvas.height + gridSize; y += gridSize) {
      ctx.globalAlpha = 0.3
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    }

    ctx.globalAlpha = 1

    // Draw existing polygons with enhanced styling
    polygons.forEach((polygon) => {
      const color = getPolygonColor(polygon, currentTime)
      const screenPoints = polygon.coordinates.map((coord) => worldToScreen(coord[0], coord[1]))
      const isHovered = hoveredPolygon === polygon.id

      if (screenPoints.length > 2) {
        // Draw shadow for depth
        ctx.save()
        ctx.translate(2, 2)
        ctx.fillStyle = "rgba(0, 0, 0, 0.1)"
        ctx.beginPath()
        ctx.moveTo(screenPoints[0].x, screenPoints[0].y)
        screenPoints.slice(1).forEach((point) => ctx.lineTo(point.x, point.y))
        ctx.closePath()
        ctx.fill()
        ctx.restore()

        // Fill polygon with gradient
        const bounds = {
          minX: Math.min(...screenPoints.map((p) => p.x)),
          maxX: Math.max(...screenPoints.map((p) => p.x)),
          minY: Math.min(...screenPoints.map((p) => p.y)),
          maxY: Math.max(...screenPoints.map((p) => p.y)),
        }

        const polygonGradient = ctx.createLinearGradient(bounds.minX, bounds.minY, bounds.maxX, bounds.maxY)
        polygonGradient.addColorStop(0, color + (isHovered ? "CC" : "99"))
        polygonGradient.addColorStop(1, color + (isHovered ? "AA" : "77"))

        ctx.fillStyle = polygonGradient
        ctx.beginPath()
        ctx.moveTo(screenPoints[0].x, screenPoints[0].y)
        screenPoints.slice(1).forEach((point) => ctx.lineTo(point.x, point.y))
        ctx.closePath()
        ctx.fill()

        // Stroke polygon with enhanced styling
        ctx.strokeStyle = color
        ctx.lineWidth = isHovered ? 3 : 2
        ctx.setLineDash([])
        ctx.stroke()

        // Draw vertices with glow effect
        screenPoints.forEach((point, index) => {
          // Glow effect
          ctx.save()
          ctx.shadowColor = color
          ctx.shadowBlur = isHovered ? 10 : 5
          ctx.fillStyle = "#ffffff"
          ctx.beginPath()
          ctx.arc(point.x, point.y, isHovered ? 6 : 4, 0, 2 * Math.PI)
          ctx.fill()
          ctx.restore()

          // Inner dot
          ctx.fillStyle = color
          ctx.beginPath()
          ctx.arc(point.x, point.y, isHovered ? 3 : 2, 0, 2 * Math.PI)
          ctx.fill()

          // Vertex number for hovered polygon
          if (isHovered) {
            ctx.fillStyle = "#ffffff"
            ctx.font = "10px Arial"
            ctx.textAlign = "center"
            ctx.fillText((index + 1).toString(), point.x, point.y + 3)
          }
        })

        // Draw polygon label with enhanced styling
        if (polygon.center) {
          const centerScreen = worldToScreen(polygon.center.lat, polygon.center.lng)

          // Label background
          const labelText = `Polygon ${polygon.id.split("_")[1]}`
          ctx.font = "12px Arial"
          ctx.textAlign = "center"
          const textMetrics = ctx.measureText(labelText)
          const padding = 6

          ctx.fillStyle = isDarkMode ? "rgba(0, 0, 0, 0.9)" : "rgba(255, 255, 255, 0.9)"
          ctx.strokeStyle = color
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.roundRect(
            centerScreen.x - textMetrics.width / 2 - padding,
            centerScreen.y - 8 - padding,
            textMetrics.width + padding * 2,
            16 + padding * 2,
            4,
          )
          ctx.fill()
          ctx.stroke()

          // Label text
          ctx.fillStyle = isDarkMode ? "#f3f4f6" : "#374151"
          ctx.fillText(labelText, centerScreen.x, centerScreen.y + 3)
        }
      }
    })

    // Draw current drawing points with enhanced styling
    if (isDrawing && drawingPoints.length > 0) {
      // Draw connection lines
      if (drawingPoints.length > 1) {
        ctx.strokeStyle = "#3b82f6"
        ctx.lineWidth = 2
        ctx.setLineDash([])
        ctx.beginPath()
        ctx.moveTo(drawingPoints[0].x, drawingPoints[0].y)
        drawingPoints.slice(1).forEach((point) => ctx.lineTo(point.x, point.y))
        ctx.stroke()
      }

      // Draw preview line to mouse
      if (drawingPoints.length > 0) {
        ctx.strokeStyle = "#3b82f6"
        ctx.lineWidth = 2
        ctx.setLineDash([5, 5])
        ctx.beginPath()
        ctx.moveTo(drawingPoints[drawingPoints.length - 1].x, drawingPoints[drawingPoints.length - 1].y)
        ctx.lineTo(lastMousePos.x, lastMousePos.y)
        ctx.stroke()
        ctx.setLineDash([])
      }

      // Draw points with glow effect
      drawingPoints.forEach((point, index) => {
        // Glow
        ctx.save()
        ctx.shadowColor = "#3b82f6"
        ctx.shadowBlur = 10
        ctx.fillStyle = "#ffffff"
        ctx.beginPath()
        ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI)
        ctx.fill()
        ctx.restore()

        // Point
        ctx.fillStyle = "#3b82f6"
        ctx.beginPath()
        ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI)
        ctx.fill()

        // Point number
        ctx.fillStyle = "#ffffff"
        ctx.font = "10px Arial"
        ctx.textAlign = "center"
        ctx.fillText((index + 1).toString(), point.x, point.y + 3)
      })
    }

    // Draw zoom level and coordinates
    ctx.fillStyle = isDarkMode ? "#f3f4f6" : "#374151"
    ctx.font = "14px Arial"
    ctx.textAlign = "left"
    ctx.fillText(`Zoom: ${mapState.zoom.toFixed(1)}x`, 15, 25)
    ctx.fillText(`Center: (${mapState.centerX.toFixed(0)}, ${mapState.centerY.toFixed(0)})`, 15, 45)
  }, [
    mapState,
    polygons,
    getPolygonColor,
    currentTime,
    isDrawing,
    drawingPoints,
    lastMousePos,
    worldToScreen,
    hoveredPolygon,
    isDarkMode,
  ])

  // Handle canvas resize
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height
      drawMap()
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)
    return () => window.removeEventListener("resize", resizeCanvas)
  }, [drawMap])

  useEffect(() => {
    drawMap()
  }, [drawMap])

  const handleMouseDown = (e: React.MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    if (isDrawing) {
      const worldPoint = screenToWorld(e.clientX, e.clientY)
      const screenPoint = { x: mouseX, y: mouseY }

      setDrawingPoints((prev) => [...prev, screenPoint])

      if (drawingPoints.length >= 2) {
        const firstPoint = drawingPoints[0]
        const distance = Math.sqrt(Math.pow(mouseX - firstPoint.x, 2) + Math.pow(mouseY - firstPoint.y, 2))

        if (distance < 15 && drawingPoints.length >= 3) {
          completePolygon()
          return
        }
      }
    } else {
      const worldPoint = screenToWorld(e.clientX, e.clientY)
      const clickedPolygon = polygons.find((polygon) => {
        return isPointInPolygon(
          worldPoint,
          polygon.coordinates.map((coord) => ({ x: coord[0], y: coord[1] })),
        )
      })

      if (clickedPolygon) {
        if (confirm(`Delete polygon ${clickedPolygon.id.split("_")[1]}?`)) {
          onPolygonDelete(clickedPolygon.id)
        }
      } else {
        setIsDragging(true)
        setLastMousePos({ x: mouseX, y: mouseY })
      }
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    setLastMousePos({ x: mouseX, y: mouseY })

    // Check for polygon hover
    if (!isDrawing && !isDragging) {
      const worldPoint = screenToWorld(e.clientX, e.clientY)
      const hoveredPoly = polygons.find((polygon) => {
        return isPointInPolygon(
          worldPoint,
          polygon.coordinates.map((coord) => ({ x: coord[0], y: coord[1] })),
        )
      })
      setHoveredPolygon(hoveredPoly?.id || null)
    }

    if (isDragging && !isDrawing) {
      const deltaX = (mouseX - lastMousePos.x) / mapState.zoom
      const deltaY = (mouseY - lastMousePos.y) / mapState.zoom

      setMapState((prev) => ({
        ...prev,
        centerX: prev.centerX - deltaX,
        centerY: prev.centerY - deltaY,
      }))

      setLastMousePos({ x: mouseX, y: mouseY })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1
    setMapState((prev) => ({
      ...prev,
      zoom: Math.max(0.1, Math.min(5, prev.zoom * zoomFactor)),
    }))
  }

  const handleDoubleClick = () => {
    if (isDrawing && drawingPoints.length >= 3) {
      completePolygon()
    }
  }

  const completePolygon = () => {
    if (drawingPoints.length < 3) {
      alert("Polygon must have at least 3 points")
      return
    }

    if (drawingPoints.length > 12) {
      alert("Polygon cannot have more than 12 points")
      return
    }

    const worldCoordinates = drawingPoints.map((point) => {
      const world = screenToWorld(
        point.x + canvasRef.current!.getBoundingClientRect().left,
        point.y + canvasRef.current!.getBoundingClientRect().top,
      )
      return [world.x, world.y] as [number, number]
    })

    const centerX = worldCoordinates.reduce((sum, coord) => sum + coord[0], 0) / worldCoordinates.length
    const centerY = worldCoordinates.reduce((sum, coord) => sum + coord[1], 0) / worldCoordinates.length

    const polygon: Polygon = {
      id: `polygon_${Date.now()}`,
      coordinates: worldCoordinates,
      center: { lat: centerX, lng: centerY },
      dataSourceId: "temperature",
    }

    setDrawingPoints([])
    onDrawingChange(false)
    onPolygonCreate(polygon)
  }

  const cancelDrawing = () => {
    setDrawingPoints([])
    onDrawingChange(false)
  }

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isDrawing) {
        cancelDrawing()
      }
    }

    document.addEventListener("keydown", handleKeyPress)
    return () => document.removeEventListener("keydown", handleKeyPress)
  }, [isDrawing])

  const isPointInPolygon = (point: Point, polygon: Point[]): boolean => {
    let inside = false
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      if (
        polygon[i].y > point.y !== polygon[j].y > point.y &&
        point.x <
          ((polygon[j].x - polygon[i].x) * (point.y - polygon[i].y)) / (polygon[j].y - polygon[i].y) + polygon[i].x
      ) {
        inside = !inside
      }
    }
    return inside
  }

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        onDoubleClick={handleDoubleClick}
        style={{ cursor: isDrawing ? "crosshair" : isDragging ? "grabbing" : hoveredPolygon ? "pointer" : "grab" }}
      />

      {/* Enhanced Drawing Instructions */}
      {isDrawing && (
        <Card className="absolute top-4 left-4 border-0 shadow-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white max-w-sm">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="font-semibold">Drawing Mode Active</span>
              </div>
              <div className="text-sm space-y-1 opacity-90">
                <div>• Click to add points ({drawingPoints.length}/12)</div>
                <div>• Double-click or click near first point to complete</div>
                <div>• Press ESC to cancel</div>
                <div>• Need 3-12 points minimum</div>
              </div>
              {drawingPoints.length > 0 && (
                <div className="pt-2 border-t border-white/20">
                  <div className="text-xs opacity-75">Current points: {drawingPoints.length}</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Map Controls */}
      <Card className="absolute top-4 right-4 border-0 shadow-xl bg-white/95 backdrop-blur-sm">
        <CardContent className="p-3">
          <div className="space-y-3">
            <div className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
              <Navigation className="h-4 w-4" />
              <span>Map Controls</span>
            </div>
            <div className="text-xs text-gray-600 space-y-1">
              <div>• Zoom: Mouse wheel</div>
              <div>• Pan: Click and drag</div>
              <div>• Delete: Click polygon</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Zoom Controls */}
      <Card className="absolute bottom-4 right-4 border-0 shadow-xl bg-white/95 backdrop-blur-sm">
        <CardContent className="p-2">
          <div className="flex flex-col space-y-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMapState((prev) => ({ ...prev, zoom: Math.min(5, prev.zoom * 1.2) }))}
              className="transition-all duration-200 hover:scale-105"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMapState((prev) => ({ ...prev, zoom: Math.max(0.1, prev.zoom / 1.2) }))}
              className="transition-all duration-200 hover:scale-105"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMapState({ centerX: 0, centerY: 0, zoom: 1 })}
              className="transition-all duration-200 hover:scale-105"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Polygon Hover Info */}
      {hoveredPolygon && !isDrawing && (
        <Card className="absolute bottom-4 left-4 border-0 shadow-xl bg-white/95 backdrop-blur-sm">
          <CardContent className="p-3">
            <div className="text-sm">
              <div className="font-semibold text-gray-700">Polygon {hoveredPolygon.split("_")[1]}</div>
              <div className="text-xs text-gray-500 mt-1">Click to delete</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

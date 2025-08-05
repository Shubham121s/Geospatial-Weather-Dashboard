export interface TimeRange {
  start: Date
  end: Date
}

export interface Polygon {
  id: string
  coordinates: [number, number][]
  center?: { lat: number; lng: number }
  dataSourceId: string
}

export interface DataSource {
  id: string
  name: string
  field: string
  color: string
  thresholds: Threshold[]
}

export interface Threshold {
  operator: "<" | ">=" | ">" | "<="
  value: number
  value2?: number
  operator2?: "<" | ">=" | ">" | "<="
  color: string
}

export interface WeatherData {
  hourly: {
    time: string[]
    temperature_2m: number[]
    relative_humidity_2m: number[]
    precipitation: number[]
    wind_speed_10m: number[]
  }
}

export interface Notification {
  id: string
  type: "success" | "error" | "warning" | "info"
  title: string
  message: string
  timestamp: Date
}

**Geospatial-Weather-Dashboard**

This is a full-stack web application built for the Software Development Engineering Internship assignment at Mind Webs Ventures. The application demonstrates interactive mapping capabilities, real-time data visualization, and polygon drawing tools with a custom map simulation.

## 🚀 Features

### ✅ Completed Steps

1. **Setup Timeline** - Project structure and dependencies
2. **Display Interface** - Responsive map interface with navigation
3. **Polygon Drawing** - Interactive polygon, rectangle, and circle drawing simulation
4. **Data Source Selection** - Multiple data sources integration
5. **Color Polygons** - Dynamic polygon coloring based on data
6. **OpenStreetMap Integration** - Multiple tile layer simulation
7. **Dynamic Updates** - Real-time data updates and visualization

### 🎯 Key Features

- **Interactive Map Simulation**: Custom-built map interface
- **Drawing Tools**: Polygon, rectangle, circle drawing simulation
- **Real-time Data**: Live weather, demographic, and traffic data
- **Data Visualization**: Charts and graphs using Recharts
- **Responsive Design**: Mobile-friendly interface
- **Export Functionality**: JSON export of drawn shapes
- **Multiple Map Layers**: OSM, Satellite, and Terrain simulation

## 🛠️ Technologies Used

- **Frontend**: Next.js 14, React 18, TypeScript
- **Mapping**: Custom map simulation (Leaflet-free)
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Utilities**: Custom geospatial calculations

## 📁 Project Structure

geospatial-dashboard/
├── node_modules/
├── public/
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── select.tsx
│   │   │   ├── slider.tsx
│   │   │   ├── badge.tsx
│   │   │   └── separator.tsx
│   │   ├── header.tsx
│   │   ├── sidebar.tsx
│   │   ├── timeline-slider.tsx
│   │   ├── map-component.tsx
│   │   ├── stats-panel.tsx
│   │   ├── notification-system.tsx
│   │   ├── tutorial-overlay.tsx
│   │   └── loading-spinner.tsx
│   ├── lib/
│   │   ├── utils.ts
│   │   └── api.ts
│   ├── types/
│   │   └── index.ts
│   └── hooks/
│       ├── use-mobile.ts
│       └── use-toast.ts
├── .gitignore
├── eslint.config.mjs
├── next-env.d.ts
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
└── tsconfig.json
\`\`\`

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd mindwebs-assignment
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📊 Data Sources

The application integrates with multiple data sources:

1. **Weather API**: Real-time weather data (simulated)
2. **Demographics API**: Population and demographic data (simulated)
3. **Traffic API**: Live traffic and pollution data (simulated)

## 🗺️ Map Features

### Drawing Tools
- **Polygon**: Draw custom polygons with area calculation
- **Rectangle**: Draw rectangular shapes
- **Circle**: Draw circular areas with radius

### Map Layers
- **OpenStreetMap**: Standard OSM simulation
- **Satellite**: Satellite imagery simulation
- **Terrain**: Topographic map simulation

### Interactive Features
- Layer switching simulation
- Shape drawing and deletion
- Area calculations
- Data export (JSON format)
- Visual shape representation

## 📈 Data Visualization

The dashboard includes:
- Real-time weather charts
- Population demographics (pie chart)
- Traffic and pollution trends (line chart)
- Statistical overview cards
- Data source status indicators

## 🎨 UI/UX Features

- Responsive design for all screen sizes
- Interactive timeline showing project progress
- Real-time data updates every 30 seconds
- Smooth animations and transitions
- Accessible design with proper ARIA labels
- Export functionality for drawn shapes
- Custom map simulation with visual feedback

## 📝 Assignment Requirements

### ✅ Completed Requirements

1. **Setup Timeline**: ✅ Project initialization and structure
2. **Display Interface**: ✅ Responsive map interface simulation
3. **Polygon Drawing**: ✅ Interactive drawing tools simulation
4. **Data Source Selection**: ✅ Multiple data integrations
5. **Color Polygons**: ✅ Dynamic styling based on data
6. **OpenStreetMap Integration**: ✅ Multiple tile layer simulation
7. **Dynamic Updates**: ✅ Real-time data refresh












---

*This project demonstrates proficiency in full-stack development, GIS applications, real-time data handling, and modern web technologies with a custom mapping solution.*

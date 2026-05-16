# 🧰 The Toolbox | Tactical Route Planner

**The Toolbox** is a premium, industrial-grade logistics and route optimization interface designed for high-performance dispatch operations. It features a "True Black" monochromatic aesthetic, high-contrast tactical map surfaces, and real-time fleet synchronization.

![The Toolbox Interface](public/favicon.svg)

## 🚀 Key Features

- **Tactical Surface Engine**: Custom-built Google Maps integration with high-contrast industrial styling and custom SVG marker clusters.
- **Dynamic Route Optimization**: Intelligent straight-line pathing and logistical grouping for complex multi-vehicle nodes.
- **True Black Aesthetic**: A curated high-contrast UI (monochrome) designed for maximum focus and visual clarity in professional dispatch environments.
- **Live Fleet Management**: Real-time vehicle assignment, group manifest tracking, and logistical state synchronization via React Context.
- **Seamless Data Ingestion**: Robust clipboard/paste-based ticket ingestion with automated geocoding and node resolution.

## 🛠️ Technology Stack

- **Framework**: [Next.js 14+](https://nextjs.org/) (App Router)
- **Mapping**: [@vis.gl/react-google-maps](https://visgl.github.io/react-google-maps/)
- **State Management**: React Context with robust synchronization logic.
- **Styling**: TailwindCSS with custom high-contrast industrial color palettes.
- **Icons**: [Lucide React](https://lucide.dev/) + Custom SVG Generators.
- **Font**: [Outfit](https://fonts.google.com/specimen/Outfit) (Geometric Sans-Serif).

## 📥 Getting Started

### Prerequisites

- Node.js 18+
- Google Maps API Key with **Maps JavaScript API** and **Geocoding API** enabled.

### Installation

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd Toolbox_v1
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment**:
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```

5. **Build for Production**:
   ```bash
   npm run build
   ```

## 📐 Architecture

- **`src/app/`**: Core application pages and the main `MapComponent` engine.
- **`src/components/`**: Modularized UI components (Header, FleetModal, NodeGroupCard, etc.).
- **`src/context/`**: Global state management via `DispatchContext`.
- **`src/lib/`**: Constant definitions and logistical utility functions.

## 📄 License

Internal use only. All rights reserved.

---
*Built with precision for professional logistics.*

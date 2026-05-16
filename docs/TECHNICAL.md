# Technical Documentation | The Toolbox

This document provides a deep dive into the technical architecture and logic of The Toolbox Route Planner.

## 1. Global State Management (`DispatchContext.tsx`)

The application uses a centralized `DispatchProvider` to manage all logistical data.

- **State Persistence**: The context handles the lifecycle of `vehicles`, `groups` (ticket nodes), and `assignments`.
- **Vehicle Synchronization**: Assignments are stored as a map of `groupId -> vehicleId`.
- **Geocoding Pipeline**: Integrated manifest processing that resolves physical addresses into geographic coordinates using the Google Maps Geocoding API.

## 2. Map Engine (`MapComponent.tsx`)

The tactical map surface is built on `@vis.gl/react-google-maps` with several custom layers:

### Marker Logic
- **Warehouse Pin**: A declarative `<Marker />` component using a high-contrast industrial circle design. Fixed at the operational base coordinates.
- **Node Clusters**: Dynamic SVG markers generated based on ticket volume and priority.
- **Tactical Paths**: Polylines representing assigned routes between the warehouse and resolved nodes.

### Viewport Management
- **FitBounds**: The map intelligently calculates a bounding box to include the warehouse and all active logistical nodes, ensuring the entire operation is visible on load or update.
- **Industrial Styling**: Uses a customized `LIGHT_STYLES` configuration that strips standard Google Map labels (POI, Transit) to focus entirely on logistics.

## 3. UI/UX Philosophy

- **High-Contrast Minimalism**: Every component uses a strict grayscale palette with strategic color accents (e.g., `#a855f7` for mixed assignments).
- **Tactical Feedback**: Visual cues like the "Spotlight" effect on map nodes when interacting with dispatch cards.
- **Industrial Typography**: Heavy use of `font-black` and `tracking-widest` to mimic industrial equipment interfaces.

## 4. Operational Workflows

### Manifest Ingestion
1. User pastes raw data into the `ManifestModal`.
2. The system parses tab-separated values.
3. Coordinates are resolved, and tickets are grouped by physical proximity.
4. Groups are rendered as tactical nodes on the map.

### Dispatching
1. Dispatcher selects a vehicle from the list.
2. The vehicle is assigned to a node group.
3. A tactical path is drawn on the map.
4. The group card updates with a high-contrast assignment badge.

## 5. Development Guidelines

- **Component Creation**: Maintain the "True Black" aesthetic. Avoid rounded corners exceeding `xl`.
- **State Updates**: All logistical mutations must go through the `useDispatch` hook to maintain cross-component synchronization.

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

## 4. UI Component Architecture

The interface is divided into functional modules that interact with the global state:

- **`Header.tsx`**: Contains the brand identity, city code resolution, and fleet management trigger.
- **`DispatchConsole.tsx`**: The primary data grid. It maps resolved nodes to cards and provides the interface for vehicle assignment.
- **`NodeGroupCard.tsx`**: Renders ticket volume summaries and assignment status. It includes a "Focus" action that communicates directly with the map engine.
- **`ManifestModal.tsx`**: Handles bulk ticket ingestion via a high-performance clipboard parser.
- **`FleetModal.tsx`**: Manages the active vehicle roster and assignment availability.

## 5. Event Communication System

The Toolbox uses a decoupled event-based system to allow UI components to control the map without prop-drilling or complex state management.

### Map Actions (`tactical-map-action`)
Triggered via `window.dispatchEvent`, this allows remote control of map viewport actions:
- `pan`: Resets view to include all active nodes.
- `in / out`: Programmatic zoom control.

### Node Focusing (`tactical-map-focus-node`)
Triggered when a user interacts with a Dispatch Card. The map engine listens for this event to smoothly pan and zoom into the specific node's coordinates.

### Route Visualization (`tactical-map-visualize-route`)
Calculates and renders the optimized logistical paths on the map layer for a specific vehicle's assigned nodes.

## 6. Logistical Optimization

The "Tactical Paths" are currently implemented as optimized straight-line vectors originating from the Warehouse. 
- **Grouping**: Tickets are grouped by proximity to reduce map clutter and improve dispatch efficiency.
- **Visual Priority**: Markers change state (color/opacity) based on their assignment status, providing immediate visual confirmation of dispatch progress.

## 7. Deployment & Environment

- **Next.js Turbopack**: Optimized for extremely fast development cycles.
- **Production Builds**: Assets are optimized for high-performance rendering on low-latency dispatch terminals.
- **Environment Safety**: API keys are restricted to client-side usage via `NEXT_PUBLIC_` prefixes.

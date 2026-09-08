import type { CameraConfig, Hotspot, VehicleColor, Vector3 } from "./content";

export type ModelQuality = "AUTO" | "HIGH" | "LOW";

export type ViewerInteractionType =
  | "ROTATE"
  | "ZOOM"
  | "RESET"
  | "VIEW_FRONT"
  | "VIEW_BACK"
  | "VIEW_LEFT"
  | "VIEW_RIGHT"
  | "VIEW_TOP"
  | "COLOR_CHANGE"
  | "HOTSPOT_CLICK"
  | "FULLSCREEN_ENTER"
  | "FULLSCREEN_EXIT"
  | "AUTO_ROTATE_START"
  | "AUTO_ROTATE_STOP";

export type ViewerStatus =
  "IDLE" | "LOADING" | "READY" | "ERROR" | "FALLBACK_IMAGE";

export interface CarViewerProps {
  vehicleId: string;
  highModelUrl?: string;
  lowModelUrl?: string;
  fallbackImageUrls: string[];
  coverImageUrl: string;
  defaultCamera: CameraConfig;
  colors: VehicleColor[];
  hotspots: Hotspot[];
  autoRotate?: boolean;
  preferredQuality?: ModelQuality;
  onLoadStart?: () => void;
  onProgress?: (progress: number) => void;
  onLoadSuccess?: () => void;
  onLoadError?: (error: Error) => void;
  onInteraction?: (type: ViewerInteractionType) => void;
}

export interface ViewerState {
  status: ViewerStatus;
  progress: number;
  quality: Exclude<ModelQuality, "AUTO"> | null;
  colorId: string | null;
  cameraPosition: Vector3;
  selectedHotspotId: string | null;
  autoRotate: boolean;
  fullscreen: boolean;
  error: Error | null;
}

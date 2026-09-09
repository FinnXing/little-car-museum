import type { Material, Object3D } from "three";
import type { CameraConfig } from "@/types";
import type { ModelQuality } from "@/types/viewer";

export interface QualitySignals {
  preferredQuality?: ModelQuality;
  hasHighModel: boolean;
  hasLowModel: boolean;
  isMobile: boolean;
  saveData: boolean;
  effectiveType?: string;
  deviceMemory?: number;
  highModelFailed?: boolean;
}

export function selectModelQuality({
  preferredQuality = "AUTO",
  hasHighModel,
  hasLowModel,
  isMobile,
  saveData,
  effectiveType,
  deviceMemory,
  highModelFailed = false,
}: QualitySignals): Exclude<ModelQuality, "AUTO"> | null {
  if (!hasHighModel && !hasLowModel) return null;
  if (preferredQuality === "HIGH" && hasHighModel && !highModelFailed)
    return "HIGH";
  if (preferredQuality === "LOW" && hasLowModel) return "LOW";
  if (highModelFailed && hasLowModel) return "LOW";

  const constrainedNetwork =
    effectiveType === "slow-2g" ||
    effectiveType === "2g" ||
    effectiveType === "3g";
  const constrainedDevice =
    isMobile ||
    saveData ||
    constrainedNetwork ||
    (deviceMemory !== undefined && deviceMemory <= 4);
  if (constrainedDevice && hasLowModel) return "LOW";
  if (hasHighModel) return "HIGH";
  return hasLowModel ? "LOW" : null;
}

export function resolveModelUrl({
  quality,
  highModelUrl,
  lowModelUrl,
}: {
  quality: Exclude<ModelQuality, "AUTO"> | null;
  highModelUrl?: string;
  lowModelUrl?: string;
}) {
  if (quality === "HIGH") return highModelUrl ?? lowModelUrl;
  if (quality === "LOW") return lowModelUrl ?? highModelUrl;
  return highModelUrl ?? lowModelUrl;
}

export type CameraPreset =
  "RESET" | "FRONT" | "BACK" | "LEFT" | "RIGHT" | "TOP";

export function cameraPositionForPreset(
  preset: CameraPreset,
  camera: CameraConfig,
): [number, number, number] {
  const distance = Math.min(
    Math.max(camera.position.z - camera.target.z, 3.5),
    camera.maxDistance,
  );
  const elevation = Math.max(camera.target.y + 0.8, 1.25);
  switch (preset) {
    case "BACK":
      return [0, elevation, -distance];
    case "LEFT":
      return [-distance, elevation, 0];
    case "RIGHT":
      return [distance, elevation, 0];
    case "TOP":
      return [0, Math.max(camera.maxDistance * 0.9, 4.8), 0.01];
    case "FRONT":
      return [0, elevation, distance];
    case "RESET":
    default:
      return [camera.position.x, camera.position.y, camera.position.z];
  }
}

export function disposeObject3D(root: Object3D) {
  root.traverse((child) => {
    const disposable = child as Object3D & {
      geometry?: { dispose?: () => void };
      material?: Material | Material[];
    };
    disposable.geometry?.dispose?.();
    if (Array.isArray(disposable.material)) {
      disposable.material.forEach((material) => material.dispose());
    } else {
      disposable.material?.dispose();
    }
  });
}

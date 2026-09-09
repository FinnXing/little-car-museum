import { BoxGeometry, DataTexture, Mesh, MeshBasicMaterial } from "three";
import { describe, expect, test, vi } from "vitest";
import {
  cameraPositionForPreset,
  disposeObject3D,
  resolveModelUrl,
  selectModelQuality,
} from "@/lib/three/viewer-utils";
import type { CameraConfig } from "@/types";

const camera: CameraConfig = {
  position: { x: 3.8, y: 2.2, z: 4.6 },
  target: { x: 0, y: 0.25, z: 0 },
  minDistance: 2.8,
  maxDistance: 8,
  minPolarAngle: 0.25,
  maxPolarAngle: 1.85,
};

describe("viewer-utils", () => {
  test("chooses a lightweight model on constrained devices and networks", () => {
    expect(
      selectModelQuality({
        hasHighModel: true,
        hasLowModel: true,
        isMobile: true,
        saveData: false,
        effectiveType: "4g",
      }),
    ).toBe("LOW");
    expect(
      selectModelQuality({
        hasHighModel: true,
        hasLowModel: true,
        isMobile: false,
        saveData: false,
        effectiveType: "4g",
        deviceMemory: 16,
      }),
    ).toBe("HIGH");
  });

  test("falls back to low model when high model fails", () => {
    expect(
      selectModelQuality({
        preferredQuality: "HIGH",
        hasHighModel: true,
        hasLowModel: true,
        isMobile: false,
        saveData: false,
        highModelFailed: true,
      }),
    ).toBe("LOW");
    expect(
      resolveModelUrl({
        quality: "LOW",
        highModelUrl: "/high.glb",
        lowModelUrl: "/low.glb",
      }),
    ).toBe("/low.glb");
  });

  test("keeps view presets within a predictable orbit", () => {
    expect(cameraPositionForPreset("FRONT", camera)).toEqual([0, 1.25, 4.6]);
    expect(cameraPositionForPreset("LEFT", camera)[0]).toBeLessThan(0);
    expect(cameraPositionForPreset("TOP", camera)[1]).toBeGreaterThan(4);
  });

  test("disposes cloned geometry and materials when the viewer unmounts", () => {
    const geometry = new BoxGeometry(1, 1, 1);
    const material = new MeshBasicMaterial();
    const texture = new DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1);
    texture.needsUpdate = true;
    material.map = texture;
    const mesh = new Mesh(geometry, material);
    const geometryDispose = vi.spyOn(geometry, "dispose");
    const materialDispose = vi.spyOn(material, "dispose");
    const textureDispose = vi.spyOn(texture, "dispose");

    disposeObject3D(mesh);

    expect(geometryDispose).toHaveBeenCalledOnce();
    expect(materialDispose).toHaveBeenCalledOnce();
    expect(textureDispose).toHaveBeenCalledOnce();
  });
});

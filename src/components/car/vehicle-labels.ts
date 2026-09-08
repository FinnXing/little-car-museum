import type { DisplayType, EnergyType } from "@/types";

export const displayTypeLabels: Record<DisplayType, string> = {
  REAL_3D: "真实车型 3D",
  GENERIC_3D: "通用 3D",
  IMAGE_SET: "多角度图片",
  STATIC_IMAGE: "单张图片",
};

export const energyTypeLabels: Record<EnergyType, string> = {
  FUEL: "燃油",
  ELECTRIC: "电动",
  HYBRID: "混合动力",
  OTHER: "其他动力",
};

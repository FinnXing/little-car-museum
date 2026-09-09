"use client";

import { useEffect } from "react";
import { recordVehicleView } from "@/lib/client/local-library";

export function useVehicleHistory(vehicleId: string) {
  useEffect(() => {
    recordVehicleView(vehicleId);
  }, [vehicleId]);
}

"use client";

import { VehicleListError } from "@/components/car/VehicleListError";

export default function CarsError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main
      id="main-content"
      className="grid min-h-dvh place-items-center px-4 py-12"
    >
      <VehicleListError onRetry={reset} />
    </main>
  );
}

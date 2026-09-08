import { VehicleListSkeleton } from "@/components/car/VehicleListSkeleton";

export default function CarsLoading() {
  return (
    <main id="main-content" className="min-h-dvh px-4 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto grid max-w-7xl gap-10">
        <div className="grid gap-4 py-8">
          <div className="h-5 w-36 rounded-full bg-ink/10 motion-safe:animate-pulse" />
          <div className="h-14 w-full max-w-xl rounded-3xl bg-ink/10 motion-safe:animate-pulse" />
        </div>
        <VehicleListSkeleton />
      </div>
    </main>
  );
}

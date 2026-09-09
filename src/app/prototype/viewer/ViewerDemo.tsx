"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import type { CameraConfig } from "@/types";
import type { CarViewerProps } from "@/types/viewer";

const CarViewer = dynamic(
  () =>
    import("@/components/three/CarViewer").then((module) => module.CarViewer),
  {
    ssr: false,
    loading: () => (
      <div
        role="status"
        className="grid min-h-[20rem] place-items-center rounded-[2rem] border-2 border-ink bg-mint-soft p-6 font-bold text-ink"
      >
        正在准备 3D 观察台…
      </div>
    ),
  },
);

const defaultCamera: CameraConfig = {
  position: { x: 3.8, y: 2.2, z: 4.6 },
  target: { x: 0, y: 0.25, z: 0 },
  minDistance: 2.8,
  maxDistance: 8,
  minPolarAngle: 0.25,
  maxPolarAngle: 1.85,
  fov: 42,
};

const viewerProps: CarViewerProps = {
  vehicleId: "placeholder-vehicle-red-sports-car",
  lowModelUrl: "/models/placeholder-car.glb",
  fallbackImageUrls: ["/placeholders/vehicle-placeholder.svg"],
  coverImageUrl: "/placeholders/vehicle-placeholder.svg",
  defaultCamera,
  colors: [
    {
      id: "placeholder-color-red",
      nameCn: "展示红",
      colorValue: "#E85D4A",
      materialNames: ["body_paint"],
      isOfficialColor: false,
      sortOrder: 1,
    },
    {
      id: "placeholder-color-teal",
      nameCn: "博物馆青",
      colorValue: "#1E9A8A",
      materialNames: ["body_paint"],
      isOfficialColor: false,
      sortOrder: 2,
    },
    {
      id: "placeholder-color-sun",
      nameCn: "阳光黄",
      colorValue: "#E8B83F",
      materialNames: ["body_paint"],
      isOfficialColor: false,
      sortOrder: 3,
    },
  ],
  hotspots: [],
  autoRotate: false,
  preferredQuality: "AUTO",
};

export function ViewerDemo() {
  return (
    <main
      id="main-content"
      className="min-h-dvh overflow-hidden px-4 py-6 sm:px-8 lg:px-12"
    >
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between gap-4 border-b-2 border-ink pb-5">
          <Link
            href="/"
            className="font-display text-lg font-black text-ink hover:text-teal"
          >
            小小汽车馆
          </Link>
          <span className="rounded-full border-2 border-ink bg-sun px-4 py-2 text-sm font-bold">
            TASK-004 原型
          </span>
        </header>

        <section className="grid gap-5 py-10 sm:py-14">
          <p className="font-display text-sm font-black tracking-[0.2em] text-orange-ink uppercase">
            A tiny 3D garage
          </p>
          <h1 className="max-w-3xl font-display text-[clamp(2.75rem,8vw,6rem)] leading-[0.92] font-black tracking-[-0.04em] text-ink">
            把汽车转一转，
            <br />
            看看它的每一面。
          </h1>
          <p className="max-w-2xl text-lg leading-8 font-semibold text-ink-muted sm:text-xl sm:leading-9">
            这是独立的 3D
            查看器原型。当前使用馆内自制的通用低模汽车，后续可以替换为已审核的
            GLB 资产。
          </p>
        </section>

        <CarViewer {...viewerProps} />

        <footer className="mt-14 flex flex-col gap-3 border-t-2 border-ink py-8 text-sm font-semibold text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <p>原型页不会把占位模型计入正式车辆数量。</p>
          <Link
            href="/cars"
            className="min-h-12 self-start py-3 font-bold text-ink underline decoration-2 underline-offset-4"
          >
            返回汽车展厅
          </Link>
        </footer>
      </div>
    </main>
  );
}

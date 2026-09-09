"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useFavorite } from "@/hooks/useFavorite";
import type { CameraConfig, Category, Vehicle } from "@/types";

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

const fallbackCamera: CameraConfig = {
  position: { x: 3.8, y: 2.2, z: 4.6 },
  target: { x: 0, y: 0.25, z: 0 },
  minDistance: 2.8,
  maxDistance: 8,
  minPolarAngle: 0.25,
  maxPolarAngle: 1.85,
  fov: 42,
};

interface VehicleDetailProps {
  vehicle: Vehicle;
  categories: readonly Category[];
}

export function VehicleDetail({ vehicle, categories }: VehicleDetailProps) {
  const { isFavorite, toggleFavorite } = useFavorite(vehicle.id);
  const [categoryName] = vehicle.categoryIds
    .map((id) => categories.find((category) => category.id === id)?.nameCn)
    .filter((name): name is string => Boolean(name));
  const camera = vehicle.defaultCamera ?? fallbackCamera;
  const modelUrl =
    vehicle.lowModelUrl ??
    (vehicle.displayType === "GENERIC_3D"
      ? "/models/placeholder-car.glb"
      : undefined);

  return (
    <main
      id="main-content"
      className="min-h-dvh overflow-hidden px-4 py-6 sm:px-8 lg:px-12"
    >
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-ink pb-5">
          <Link
            href="/cars"
            className="min-h-12 py-3 font-display text-lg font-black text-ink hover:text-teal"
          >
            ← 汽车展厅
          </Link>
          <span className="rounded-full border-2 border-ink bg-sun px-4 py-2 text-sm font-bold">
            汽车详情
          </span>
        </header>

        <div className="grid gap-10 py-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)] lg:items-start lg:py-12">
          <CarViewer
            vehicleId={vehicle.id}
            highModelUrl={vehicle.highModelUrl}
            lowModelUrl={modelUrl}
            fallbackImageUrls={vehicle.fallbackImageUrls}
            coverImageUrl={vehicle.coverImageUrl}
            defaultCamera={camera}
            colors={vehicle.colors}
            hotspots={vehicle.hotspots}
            preferredQuality="AUTO"
          />

          <aside className="grid content-start gap-6 lg:sticky lg:top-6">
            <section className="grid gap-4 rounded-[2rem] border-2 border-ink bg-card p-6 shadow-[8px_8px_0_var(--color-ink)] sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-display text-sm font-black tracking-[0.18em] text-orange-ink uppercase">
                    Meet the car
                  </p>
                  <h1 className="mt-2 font-display text-[clamp(2.5rem,6vw,4.5rem)] leading-[0.95] font-black tracking-[-0.04em] text-ink">
                    {vehicle.nameCn}
                  </h1>
                  {vehicle.nameEn ? (
                    <p className="mt-2 text-base font-semibold text-ink-muted">
                      {vehicle.nameEn}
                    </p>
                  ) : null}
                </div>
                <button
                  type="button"
                  aria-pressed={isFavorite}
                  aria-label={isFavorite ? "取消收藏" : "收藏汽车"}
                  className="grid min-h-12 min-w-12 shrink-0 place-items-center rounded-full border-2 border-ink bg-sun text-xl"
                  onClick={toggleFavorite}
                >
                  <span aria-hidden="true">{isFavorite ? "★" : "☆"}</span>
                </button>
              </div>

              <p className="text-lg leading-8 text-ink-muted">
                {vehicle.childDescription}
              </p>

              <dl className="grid grid-cols-2 gap-4 border-t-2 border-dashed border-ink/25 pt-4 text-sm">
                <div>
                  <dt className="font-bold text-ink-muted">汽车类型</dt>
                  <dd className="mt-1 font-bold text-ink">
                    {categoryName ?? "待分类"}
                  </dd>
                </div>
                {vehicle.energyType ? (
                  <div>
                    <dt className="font-bold text-ink-muted">动力</dt>
                    <dd className="mt-1 font-bold text-ink">
                      {vehicle.energyType === "ELECTRIC"
                        ? "电能"
                        : vehicle.energyType === "HYBRID"
                          ? "混合动力"
                          : vehicle.energyType === "FUEL"
                            ? "燃油"
                            : "其他"}
                    </dd>
                  </div>
                ) : null}
                {vehicle.seatCount ? (
                  <div>
                    <dt className="font-bold text-ink-muted">座位</dt>
                    <dd className="mt-1 font-bold text-ink">
                      {vehicle.seatCount} 个
                    </dd>
                  </div>
                ) : null}
              </dl>
            </section>

            <section className="rounded-[1.5rem] border-2 border-ink bg-orange-soft p-5 sm:p-6">
              <p className="font-display text-sm font-black tracking-[0.16em] text-orange-ink uppercase">
                Friendly reminder
              </p>
              <h2 className="mt-1 font-display text-xl font-black text-ink">
                这是通用汽车模型
              </h2>
              <p className="mt-2 leading-7 text-ink">
                它用来帮助认识汽车的外形，不代表任何具体品牌或量产车型。
              </p>
            </section>

            <details className="rounded-[1.5rem] border-2 border-ink bg-card p-5 sm:p-6">
              <summary className="cursor-pointer list-none font-display text-xl font-black text-ink">
                素材信息
              </summary>
              <dl className="mt-4 grid gap-3 border-t-2 border-dashed border-ink/25 pt-4 text-sm leading-6">
                <div>
                  <dt className="font-bold text-ink-muted">素材名称</dt>
                  <dd className="font-semibold text-ink">
                    馆内自制通用低模汽车
                  </dd>
                </div>
                <div>
                  <dt className="font-bold text-ink-muted">作者与来源</dt>
                  <dd className="font-semibold text-ink">
                    Little Car Museum · 项目内生成
                  </dd>
                </div>
                <div>
                  <dt className="font-bold text-ink-muted">修改说明</dt>
                  <dd className="font-semibold text-ink">
                    基础几何体组合，导出为单文件 GLB。
                  </dd>
                </div>
                <div>
                  <dt className="font-bold text-ink-muted">展示说明</dt>
                  <dd className="font-semibold text-ink">
                    通用模型，不代表具体品牌或量产车型。
                  </dd>
                </div>
              </dl>
            </details>
          </aside>
        </div>
      </div>
    </main>
  );
}

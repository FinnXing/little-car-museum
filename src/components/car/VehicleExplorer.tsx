"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Category, Vehicle } from "@/types";
import { VehicleCard } from "./VehicleCard";

interface VehicleExplorerProps {
  categories: readonly Category[];
  vehicles: readonly Vehicle[];
  isDevelopmentPreview?: boolean;
}

export function VehicleExplorer({
  categories,
  vehicles,
  isDevelopmentPreview = false,
}: VehicleExplorerProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );

  const filteredVehicles = useMemo(
    () =>
      selectedCategoryId
        ? vehicles.filter((vehicle) =>
            vehicle.categoryIds.includes(selectedCategoryId),
          )
        : vehicles,
    [selectedCategoryId, vehicles],
  );

  const selectedCategory = categories.find(
    (category) => category.id === selectedCategoryId,
  );

  return (
    <>
      <section aria-labelledby="filter-title" className="grid gap-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-display text-sm font-black tracking-[0.18em] text-teal uppercase">
              Pick a lane
            </p>
            <h2
              id="filter-title"
              className="mt-1 font-display text-2xl font-black text-ink"
            >
              按类型选汽车
            </h2>
          </div>
          <p aria-live="polite" className="font-semibold text-ink-muted">
            找到 {filteredVehicles.length} 辆
          </p>
        </div>

        <div
          className="flex gap-3 overflow-x-auto pb-2"
          aria-label="汽车分类筛选"
        >
          <button
            type="button"
            aria-pressed={selectedCategoryId === null}
            onClick={() => setSelectedCategoryId(null)}
            className="min-h-12 shrink-0 rounded-full border-2 border-ink px-5 font-bold transition-transform active:translate-y-0.5 aria-pressed:bg-ink aria-pressed:text-paper"
          >
            全部汽车
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              aria-pressed={selectedCategoryId === category.id}
              onClick={() => setSelectedCategoryId(category.id)}
              className="min-h-12 shrink-0 rounded-full border-2 border-ink bg-card px-5 font-bold transition-transform active:translate-y-0.5 aria-pressed:bg-ink aria-pressed:text-paper"
            >
              {category.nameCn}
            </button>
          ))}
        </div>
      </section>

      {isDevelopmentPreview ? (
        <p className="mt-8 inline-flex rounded-full bg-sun px-4 py-2 text-sm font-bold text-ink">
          开发占位内容 · 不计入正式上线车辆
        </p>
      ) : null}

      {filteredVehicles.length > 0 ? (
        <section
          aria-label={
            selectedCategory ? `${selectedCategory.nameCn}汽车` : "全部汽车"
          }
          className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3"
        >
          {filteredVehicles.map((vehicle, index) => (
            <VehicleCard
              key={vehicle.id}
              index={index}
              vehicle={vehicle}
              categories={categories}
            />
          ))}
        </section>
      ) : (
        <section
          aria-labelledby="empty-title"
          className="mt-8 grid justify-items-start gap-5 rounded-[2rem] border-2 border-dashed border-ink/50 bg-card p-6 sm:p-10"
        >
          <span className="text-5xl" aria-hidden="true">
            🚗
          </span>
          <div className="grid gap-2">
            <h2
              id="empty-title"
              className="font-display text-2xl font-black text-ink"
            >
              这里还没有汽车
            </h2>
            <p className="text-lg leading-8 text-ink-muted">
              稍后再来看看吧，我们正在准备新的汽车。
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {selectedCategoryId ? (
              <button
                type="button"
                onClick={() => setSelectedCategoryId(null)}
                className="min-h-12 rounded-full border-2 border-ink bg-ink px-6 font-bold text-paper"
              >
                查看全部汽车
              </button>
            ) : null}
            <Link
              href="/"
              className="grid min-h-12 place-items-center rounded-full border-2 border-ink bg-paper px-6 font-bold text-ink"
            >
              返回首页
            </Link>
          </div>
        </section>
      )}
    </>
  );
}

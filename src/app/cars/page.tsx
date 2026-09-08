import type { Metadata } from "next";
import Link from "next/link";
import { VehicleExplorer } from "@/components/car/VehicleExplorer";
import { mockCategories, mockVehicles } from "@/lib/data/mock-vehicles";

export const metadata: Metadata = {
  title: "汽车展厅 | 小小汽车馆",
  description: "按类型认识不同的汽车，找到你想观察的那一辆。",
};

export default function CarsPage() {
  const showDevelopmentFixtures = process.env.NODE_ENV === "development";

  return (
    <main
      id="main-content"
      className="min-h-dvh overflow-hidden px-4 py-6 sm:px-8 lg:px-12"
    >
      <div className="mx-auto max-w-7xl">
        <header className="flex items-center justify-between gap-4 border-b-2 border-ink pb-5">
          <Link
            href="/"
            className="font-display text-lg font-black text-ink hover:text-teal"
          >
            小小汽车馆
          </Link>
          <span className="rounded-full border-2 border-ink bg-sun px-4 py-2 text-sm font-bold">
            汽车展厅
          </span>
        </header>

        <section className="relative grid gap-6 py-12 sm:py-16 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.6fr)] lg:items-end lg:gap-16">
          <div className="grid max-w-4xl gap-5">
            <p className="font-display text-sm font-black tracking-[0.2em] text-orange-ink uppercase">
              Explore the garage
            </p>
            <h1 className="font-display text-[clamp(2.75rem,8vw,6.5rem)] leading-[0.92] font-black tracking-[-0.04em] text-ink">
              今天想认识
              <br />
              哪辆汽车？
            </h1>
          </div>
          <p className="max-w-md text-lg leading-8 font-semibold text-ink-muted sm:text-xl sm:leading-9">
            先选一种汽车，再仔细看看它的名字、外形和动力。这里的车辆都是开发占位内容。
          </p>
          <div
            className="absolute right-0 bottom-5 hidden h-2 w-48 bg-[repeating-linear-gradient(90deg,var(--color-ink)_0_24px,transparent_24px_40px)] lg:block"
            aria-hidden="true"
          />
        </section>

        <VehicleExplorer
          categories={mockCategories}
          vehicles={showDevelopmentFixtures ? mockVehicles : []}
          isDevelopmentPreview={showDevelopmentFixtures}
        />

        <footer className="mt-16 flex flex-col gap-3 border-t-2 border-ink py-8 text-sm font-semibold text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <p>通用汽车模型，不代表具体品牌或量产车型。</p>
          <Link
            href="/"
            className="min-h-12 self-start py-3 font-bold text-ink underline decoration-2 underline-offset-4"
          >
            回到博物馆入口
          </Link>
        </footer>
      </div>
    </main>
  );
}

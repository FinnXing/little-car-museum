import type { Metadata } from "next";
import Link from "next/link";
import { VehicleCollection } from "@/components/library/VehicleCollection";
import { mockVehicles } from "@/lib/data/mock-vehicles";

export const metadata: Metadata = {
  title: "最近浏览 | 小小汽车馆",
  description: "查看你最近在小小汽车馆看过的汽车。",
  robots: { index: false, follow: false },
};

export default function HistoryPage() {
  const vehicles = process.env.NODE_ENV === "development" ? mockVehicles : [];
  return (
    <main
      id="main-content"
      className="min-h-dvh overflow-hidden px-4 py-6 sm:px-8 lg:px-12"
    >
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-ink pb-5">
          <Link
            href="/"
            className="min-h-12 py-3 font-display text-lg font-black text-ink hover:text-teal"
          >
            小小汽车馆
          </Link>
          <nav aria-label="个人汽车记录" className="flex flex-wrap gap-2">
            <span
              className="grid min-h-11 place-items-center rounded-full border-2 border-ink bg-sun px-4 text-sm font-bold"
              aria-current="page"
            >
              最近浏览
            </span>
            <Link
              href="/favorites"
              className="grid min-h-11 place-items-center rounded-full border-2 border-ink bg-card px-4 text-sm font-bold"
            >
              我的收藏
            </Link>
          </nav>
        </header>
        <div className="py-10 sm:py-14">
          <VehicleCollection kind="history" vehicles={vehicles} />
        </div>
      </div>
    </main>
  );
}

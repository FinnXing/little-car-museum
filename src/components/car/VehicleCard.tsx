import Image from "next/image";
import Link from "next/link";
import type { Category, Vehicle } from "@/types";
import { displayTypeLabels, energyTypeLabels } from "./vehicle-labels";

interface VehicleCardProps {
  index: number;
  vehicle: Vehicle;
  categories: readonly Category[];
}

export function VehicleCard({ index, vehicle, categories }: VehicleCardProps) {
  const categoryNames = vehicle.categoryIds
    .map((id) => categories.find((category) => category.id === id)?.nameCn)
    .filter((name): name is string => Boolean(name));

  return (
    <article className="h-full">
      <Link
        href={`/cars/${vehicle.slug}`}
        aria-label={`查看${vehicle.nameCn}详情`}
        className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border-2 border-ink bg-card transition-transform duration-200 motion-reduce:transition-none supports-[hover:hover]:hover:-translate-y-1"
      >
        <div className="relative aspect-[16/9] overflow-hidden border-b-2 border-ink bg-mint-soft">
          <span className="absolute top-4 left-4 z-10 grid size-12 place-items-center rounded-full border-2 border-ink bg-sun font-display text-lg font-black tabular-nums">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="absolute top-4 right-4 z-10 rounded-full border-2 border-ink bg-paper px-3 py-1 font-display text-xs font-bold tracking-wide">
            开发占位
          </span>
          <Image
            src={vehicle.coverImageUrl}
            alt={`${vehicle.nameCn}的开发占位汽车轮廓`}
            fill
            className="object-cover transition-transform duration-300 motion-reduce:transition-none supports-[hover:hover]:group-hover:scale-[1.03]"
            sizes="(max-width: 767px) calc(100vw - 32px), (max-width: 1199px) 50vw, 33vw"
          />
        </div>

        <div className="flex flex-1 flex-col gap-5 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="font-display text-2xl leading-tight font-black text-ink">
                {vehicle.nameCn}
              </h2>
              {vehicle.nameEn ? (
                <p className="mt-1 truncate text-sm font-semibold text-ink-muted">
                  {vehicle.nameEn}
                </p>
              ) : null}
            </div>
            <span className="shrink-0 rounded-full bg-ink px-3 py-2 text-xs font-bold text-paper">
              未收藏
            </span>
          </div>

          <p className="line-clamp-2 leading-7 text-ink-muted">
            {vehicle.childDescription}
          </p>

          <dl className="grid grid-cols-2 gap-3 border-t border-dashed border-ink/30 pt-4 text-sm">
            <div>
              <dt className="text-xs font-bold text-ink-muted">汽车类型</dt>
              <dd className="mt-1 font-bold text-ink">
                {categoryNames.join("、") || "待分类"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-bold text-ink-muted">展示方式</dt>
              <dd className="mt-1 font-bold text-ink">
                {displayTypeLabels[vehicle.displayType]}
              </dd>
            </div>
            {vehicle.energyType ? (
              <div className="col-span-2">
                <dt className="sr-only">能源类型</dt>
                <dd className="inline-flex rounded-full bg-orange-soft px-3 py-1 font-bold text-orange-ink">
                  {energyTypeLabels[vehicle.energyType]}
                </dd>
              </div>
            ) : null}
          </dl>

          <p className="mt-auto text-sm font-bold text-teal">打开详情观察 →</p>
        </div>
      </Link>
    </article>
  );
}

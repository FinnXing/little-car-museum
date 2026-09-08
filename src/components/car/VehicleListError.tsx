import Link from "next/link";

interface VehicleListErrorProps {
  onRetry: () => void;
}

export function VehicleListError({ onRetry }: VehicleListErrorProps) {
  return (
    <section
      aria-labelledby="vehicle-error-title"
      className="mx-auto grid max-w-2xl gap-6 rounded-[2rem] border-2 border-ink bg-orange-soft p-6 sm:p-10"
    >
      <div
        className="grid size-16 place-items-center rounded-full border-2 border-ink bg-orange text-3xl"
        aria-hidden="true"
      >
        !
      </div>
      <div className="grid gap-2">
        <h1
          id="vehicle-error-title"
          className="font-display text-3xl font-black text-ink"
        >
          汽车暂时没有开过来
        </h1>
        <p className="max-w-prose text-lg leading-8 text-orange-ink">
          路上可能有点忙，请再试一次，或者先回到入口看看。
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onRetry}
          className="min-h-12 rounded-full border-2 border-ink bg-ink px-6 font-bold text-paper transition-transform active:translate-y-0.5"
        >
          再试一次
        </button>
        <Link
          href="/"
          className="grid min-h-12 place-items-center rounded-full border-2 border-ink bg-paper px-6 font-bold text-ink transition-colors hover:bg-sun"
        >
          返回首页
        </Link>
      </div>
    </section>
  );
}

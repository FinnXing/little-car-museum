import Link from "next/link";

export default function NotFound() {
  return (
    <main
      id="main-content"
      className="grid min-h-dvh place-items-center px-4 py-12 sm:px-8"
    >
      <section className="grid w-full max-w-2xl gap-5 rounded-[2rem] border-2 border-ink bg-orange-soft p-6 sm:p-10">
        <div
          className="grid size-16 place-items-center rounded-full border-2 border-ink bg-orange text-3xl font-black"
          aria-hidden="true"
        >
          !
        </div>
        <div className="grid gap-2">
          <p className="font-display text-sm font-black tracking-[0.18em] text-orange-ink uppercase">
            Not on the map
          </p>
          <h1 className="font-display text-3xl font-black text-ink">
            汽车暂时没有开过来
          </h1>
          <p className="text-lg leading-8 text-orange-ink">
            这辆汽车还没有公开，或者地址已经变化了。先回到汽车展厅看看吧。
          </p>
        </div>
        <Link
          href="/cars"
          className="grid min-h-12 w-fit place-items-center rounded-full border-2 border-ink bg-ink px-6 font-bold text-paper"
        >
          返回汽车展厅
        </Link>
      </section>
    </main>
  );
}

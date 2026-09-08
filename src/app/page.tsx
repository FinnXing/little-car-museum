import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center gap-5 px-6 py-16 sm:px-10">
      <p className="text-lg font-semibold text-teal-800">Little Car Museum</p>
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        小小汽车馆
      </h1>
      <p className="text-xl leading-relaxed text-slate-700">
        让孩子简单、安全、有趣地观察汽车、认识汽车。
      </p>
      <p className="text-base leading-relaxed text-slate-600">
        汽车馆正在准备中，期待与你一起探索。
      </p>
      <Link
        href="/cars"
        className="mt-3 grid min-h-12 w-fit place-items-center rounded-full border-2 border-ink bg-sun px-6 font-bold text-ink transition-transform active:translate-y-0.5"
      >
        进入汽车展厅
      </Link>
    </main>
  );
}

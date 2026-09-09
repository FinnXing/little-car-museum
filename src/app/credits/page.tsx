import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "素材与感谢 | 小小汽车馆",
  description: "小小汽车馆使用的模型、图片、音频与许可证记录。",
};

export default function CreditsPage() {
  return (
    <main id="main-content" className="min-h-dvh px-4 py-8 sm:px-8 lg:px-12">
      <article className="mx-auto grid max-w-3xl gap-8 rounded-[2rem] border-2 border-ink bg-card p-6 sm:p-10">
        <header className="grid gap-3 border-b-2 border-ink pb-6">
          <Link href="/" className="font-bold text-teal hover:underline">
            ← 小小汽车馆
          </Link>
          <p className="font-display text-sm font-black tracking-[0.18em] text-orange-ink uppercase">
            Credits
          </p>
          <h1 className="font-display text-4xl font-black text-ink">
            素材与感谢
          </h1>
          <p className="leading-7 text-ink-muted">
            每份公开素材都应有可追溯的来源、作者和许可证记录。
          </p>
        </header>
        <section className="grid gap-3">
          <h2 className="font-display text-2xl font-black text-ink">
            当前状态
          </h2>
          <p className="leading-8 text-ink-muted">
            当前公开页面使用项目自有占位图形和系统字体，尚未引入第三方正式模型、图片或音频。后台上传的素材在许可证审核通过并完成发布校验前不会进入公开内容。
          </p>
        </section>
        <section className="grid gap-3">
          <h2 className="font-display text-2xl font-black text-ink">
            授权记录
          </h2>
          <p className="leading-8 text-ink-muted">
            管理员会在后台记录素材名称、来源详情页、作者、许可证、获取日期、署名与修改说明。公开内容只引用允许网页展示且审核通过的记录。
          </p>
        </section>
        <footer className="border-t-2 border-dashed border-ink/25 pt-6 text-sm leading-7 text-ink-muted">
          如果发现来源或署名需要修正，请通过{" "}
          <a
            className="font-bold text-teal underline"
            href="https://github.com/FinnXing/little-car-museum/issues"
          >
            GitHub Issues
          </a>{" "}
          提交信息。
        </footer>
      </article>
    </main>
  );
}

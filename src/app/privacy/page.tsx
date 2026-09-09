import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "隐私说明 | 小小汽车馆",
  description: "小小汽车馆如何处理浏览器本地记录与管理员数据。",
};

export default function PrivacyPage() {
  return (
    <main id="main-content" className="min-h-dvh px-4 py-8 sm:px-8 lg:px-12">
      <article className="mx-auto grid max-w-3xl gap-8 rounded-[2rem] border-2 border-ink bg-card p-6 sm:p-10">
        <header className="grid gap-3 border-b-2 border-ink pb-6">
          <Link href="/" className="font-bold text-teal hover:underline">
            ← 小小汽车馆
          </Link>
          <p className="font-display text-sm font-black tracking-[0.18em] text-orange-ink uppercase">
            Privacy
          </p>
          <h1 className="font-display text-4xl font-black text-ink">
            隐私说明
          </h1>
          <p className="leading-7 text-ink-muted">
            更新日期：2026 年 9 月 9 日
          </p>
        </header>
        <section className="grid gap-3">
          <h2 className="font-display text-2xl font-black text-ink">
            儿童访问区域
          </h2>
          <p className="leading-8 text-ink-muted">
            小小汽车馆不要求儿童注册，也不收集姓名、联系方式、精确位置或可识别的行为档案。收藏和最近浏览只保存在当前浏览器的
            LocalStorage 中，不会上传到服务器。
          </p>
        </section>
        <section className="grid gap-3">
          <h2 className="font-display text-2xl font-black text-ink">
            必要的技术数据
          </h2>
          <p className="leading-8 text-ink-muted">
            网站服务器可能记录处理请求所需的匿名技术日志，例如时间、状态码和经过截断的请求标识。日志不包含收藏内容、输入文本或儿童身份信息。
          </p>
        </section>
        <section className="grid gap-3">
          <h2 className="font-display text-2xl font-black text-ink">
            管理员数据
          </h2>
          <p className="leading-8 text-ink-muted">
            后台仅供授权管理员使用，账号邮箱、密码哈希、上传记录和素材授权信息用于内容维护与安全审计，不会展示给普通访问者。
          </p>
        </section>
        <footer className="border-t-2 border-dashed border-ink/25 pt-6 text-sm leading-7 text-ink-muted">
          如需更正或删除相关内容，请通过{" "}
          <a
            className="font-bold text-teal underline"
            href="https://github.com/FinnXing/little-car-museum/issues"
          >
            GitHub Issues
          </a>{" "}
          联系项目维护者。
        </footer>
      </article>
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "管理员登录 | 小小汽车馆",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <main
      id="main-content"
      className="grid min-h-dvh place-items-center bg-paper px-4 py-8 sm:px-8"
    >
      <section className="w-full max-w-md rounded-[2rem] border-2 border-ink bg-card p-6 shadow-[8px_8px_0_var(--color-ink)] sm:p-10">
        <div className="mb-8 grid gap-3">
          <p className="font-display text-sm font-black tracking-[0.2em] text-teal uppercase">
            Little Car Museum
          </p>
          <h1 className="font-display text-4xl font-black tracking-tight text-ink">
            管理员登录
          </h1>
          <p className="leading-7 text-ink-muted">
            仅供内容管理员使用。这里不会提供公众注册入口。
          </p>
        </div>

        <LoginForm />

        <Link
          href="/"
          className="mt-6 inline-flex min-h-12 items-center font-bold text-ink underline decoration-2 underline-offset-4"
        >
          返回小小汽车馆
        </Link>
      </section>
    </main>
  );
}

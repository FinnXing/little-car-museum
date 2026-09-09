"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const links = [
  ["/admin", "总览"],
  ["/admin/categories", "分类"],
  ["/admin/brands", "品牌"],
  ["/admin/vehicles", "汽车"],
  ["/admin/assets", "上传素材"],
  ["/admin/licenses", "许可证"],
] as const;

export function AdminNav() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function logout() {
    setIsLoggingOut(true);
    try {
      await fetch("/api/v1/admin/logout", { method: "POST" });
    } finally {
      router.replace("/admin/login");
      router.refresh();
    }
  }

  return (
    <nav className="flex flex-wrap items-center gap-2 border-b-2 border-ink pb-4">
      <Link
        href="/admin"
        className="mr-auto font-display text-lg font-black text-ink"
      >
        小小汽车馆 · 后台
      </Link>
      <div className="flex flex-wrap gap-2" aria-label="后台导航">
        {links.slice(1).map(([href, label]) => (
          <Link
            key={href}
            href={href}
            className="min-h-11 rounded-full border-2 border-ink bg-card px-4 py-2 text-sm font-bold text-ink hover:bg-sun"
          >
            {label}
          </Link>
        ))}
      </div>
      <button
        type="button"
        onClick={logout}
        disabled={isLoggingOut}
        className="min-h-11 rounded-full border-2 border-ink bg-ink px-4 py-2 text-sm font-bold text-paper disabled:opacity-60"
      >
        {isLoggingOut ? "退出中…" : "退出登录"}
      </button>
    </nav>
  );
}

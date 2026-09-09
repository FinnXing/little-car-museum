"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

function safeNextPath(value: string | null) {
  return value && value.startsWith("/") && !value.startsWith("//")
    ? value
    : "/admin";
}

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/v1/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const body = (await response.json()) as {
        success?: boolean;
        error?: { message?: string };
      };

      if (!response.ok || !body.success) {
        setError(body.error?.message || "登录失败，请稍后再试。");
        return;
      }

      const nextPath = new URLSearchParams(window.location.search).get("next");
      router.replace(safeNextPath(nextPath));
      router.refresh();
    } catch {
      setError("网络暂时不可用，请稍后再试。");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <div className="grid gap-2">
        <label htmlFor="admin-email" className="font-bold text-ink">
          管理员邮箱
        </label>
        <input
          id="admin-email"
          name="email"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="min-h-12 rounded-xl border-2 border-ink bg-paper px-4 text-lg text-ink outline-none focus:ring-4 focus:ring-teal/30"
        />
      </div>

      <div className="grid gap-2">
        <label htmlFor="admin-password" className="font-bold text-ink">
          密码
        </label>
        <input
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          minLength={8}
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="min-h-12 rounded-xl border-2 border-ink bg-paper px-4 text-lg text-ink outline-none focus:ring-4 focus:ring-teal/30"
        />
      </div>

      {error ? (
        <p
          role="alert"
          className="rounded-xl bg-coral/20 px-4 py-3 font-semibold text-ink"
        >
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="min-h-12 rounded-full border-2 border-ink bg-teal px-6 font-display font-black text-ink transition-transform hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60"
      >
        {isSubmitting ? "登录中…" : "登录后台"}
      </button>
    </form>
  );
}

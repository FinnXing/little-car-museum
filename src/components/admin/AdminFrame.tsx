import type { ReactNode } from "react";
import { AdminNav } from "./AdminNav";

export function AdminFrame({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main
      id="main-content"
      className="min-h-dvh bg-paper px-4 py-6 sm:px-8 lg:px-12"
    >
      <div className="mx-auto grid max-w-7xl gap-8">
        <AdminNav />
        <header className="grid gap-3">
          <p className="font-display text-sm font-black tracking-[0.18em] text-teal uppercase">
            Content studio
          </p>
          <h1 className="font-display text-4xl font-black tracking-tight text-ink sm:text-5xl">
            {title}
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-ink-muted">
            {description}
          </p>
        </header>
        {children}
      </div>
    </main>
  );
}

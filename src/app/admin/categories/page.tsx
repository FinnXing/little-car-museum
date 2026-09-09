"use client";

import { FormEvent, useEffect, useState } from "react";
import { AdminFrame } from "@/components/admin/AdminFrame";
import type { Category } from "@/types";

type AdminCategory = Category & { _count?: { vehicles: number } };
type CategoryForm = {
  slug: string;
  nameCn: string;
  nameEn: string;
  sortOrder: string;
  enabled: boolean;
};

const emptyForm: CategoryForm = {
  slug: "",
  nameCn: "",
  nameEn: "",
  sortOrder: "0",
  enabled: true,
};

async function readResponse(response: Response) {
  const body = (await response.json()) as {
    success?: boolean;
    data?: unknown;
    error?: { message?: string };
  };
  if (!response.ok || !body.success) {
    throw new Error(body.error?.message || "请求失败，请稍后再试。");
  }
  return body.data;
}

export default function AdminCategoriesPage() {
  const [items, setItems] = useState<AdminCategory[]>([]);
  const [form, setForm] = useState<CategoryForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setIsLoading(true);
    try {
      const response = await fetch("/api/v1/admin/categories");
      setItems((await readResponse(response)) as AdminCategory[]);
      setError(null);
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "加载失败。",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, []);

  function edit(item: AdminCategory) {
    setEditingId(item.id);
    setForm({
      slug: item.slug,
      nameCn: item.nameCn,
      nameEn: item.nameEn || "",
      sortOrder: String(item.sortOrder),
      enabled: item.enabled,
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch(
        editingId
          ? `/api/v1/admin/categories/${editingId}`
          : "/api/v1/admin/categories",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            ...form,
            sortOrder: Number(form.sortOrder),
          }),
        },
      );
      await readResponse(response);
      resetForm();
      await load();
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "保存失败。",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function remove(item: AdminCategory) {
    if (
      !window.confirm(
        `确认删除分类“${item.nameCn}”吗？有关联汽车时删除会被拒绝。`,
      )
    ) {
      return;
    }
    try {
      const response = await fetch(`/api/v1/admin/categories/${item.id}`, {
        method: "DELETE",
      });
      await readResponse(response);
      await load();
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "删除失败。",
      );
    }
  }

  return (
    <AdminFrame
      title="分类管理"
      description="新增或编辑汽车分类，停用分类不会删除历史关联。"
    >
      <section className="grid gap-8 lg:grid-cols-[minmax(18rem,0.7fr)_minmax(0,1.3fr)]">
        <form
          onSubmit={submit}
          className="grid content-start gap-4 rounded-[1.5rem] border-2 border-ink bg-card p-5"
        >
          <h2 className="font-display text-2xl font-black text-ink">
            {editingId ? "编辑分类" : "新增分类"}
          </h2>
          <label className="grid gap-2 font-bold">
            Slug
            <input
              required
              value={form.slug}
              onChange={(event) =>
                setForm({ ...form, slug: event.target.value })
              }
              className="min-h-11 rounded-xl border-2 border-ink bg-paper px-3 font-normal"
            />
          </label>
          <label className="grid gap-2 font-bold">
            中文名称
            <input
              required
              value={form.nameCn}
              onChange={(event) =>
                setForm({ ...form, nameCn: event.target.value })
              }
              className="min-h-11 rounded-xl border-2 border-ink bg-paper px-3 font-normal"
            />
          </label>
          <label className="grid gap-2 font-bold">
            英文名称
            <input
              value={form.nameEn}
              onChange={(event) =>
                setForm({ ...form, nameEn: event.target.value })
              }
              className="min-h-11 rounded-xl border-2 border-ink bg-paper px-3 font-normal"
            />
          </label>
          <label className="grid gap-2 font-bold">
            排序值
            <input
              type="number"
              value={form.sortOrder}
              onChange={(event) =>
                setForm({ ...form, sortOrder: event.target.value })
              }
              className="min-h-11 rounded-xl border-2 border-ink bg-paper px-3 font-normal"
            />
          </label>
          <label className="flex min-h-11 items-center gap-3 font-bold">
            <input
              type="checkbox"
              checked={form.enabled}
              onChange={(event) =>
                setForm({ ...form, enabled: event.target.checked })
              }
              className="size-5 accent-teal"
            />
            启用分类
          </label>
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className="min-h-11 rounded-full border-2 border-ink bg-teal px-5 font-bold disabled:opacity-60"
            >
              {isSaving ? "保存中…" : editingId ? "保存修改" : "新增分类"}
            </button>
            {editingId ? (
              <button
                type="button"
                onClick={resetForm}
                className="min-h-11 rounded-full border-2 border-ink bg-paper px-5 font-bold"
              >
                取消编辑
              </button>
            ) : null}
          </div>
        </form>

        <section className="grid gap-3" aria-live="polite">
          <h2 className="font-display text-2xl font-black text-ink">
            已有分类
          </h2>
          {error ? (
            <p
              role="alert"
              className="rounded-xl bg-coral/20 p-4 font-semibold"
            >
              {error}
            </p>
          ) : null}
          {isLoading ? (
            <p className="rounded-xl border-2 border-dashed border-ink/50 p-6 text-ink-muted">
              加载中…
            </p>
          ) : items.length === 0 ? (
            <p className="rounded-xl border-2 border-dashed border-ink/50 p-6 text-ink-muted">
              还没有分类。
            </p>
          ) : (
            <div className="grid gap-3">
              {items.map((item) => (
                <article
                  key={item.id}
                  className="flex flex-wrap items-center gap-3 rounded-xl border-2 border-ink bg-card p-4"
                >
                  <div className="mr-auto grid gap-1">
                    <h3 className="font-bold text-ink">{item.nameCn}</h3>
                    <p className="text-sm text-ink-muted">
                      {item.slug} · {item._count?.vehicles ?? 0} 辆汽车 ·{" "}
                      {item.enabled ? "启用" : "停用"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => edit(item)}
                    className="min-h-10 rounded-full border-2 border-ink px-4 text-sm font-bold"
                  >
                    编辑
                  </button>
                  <button
                    type="button"
                    onClick={() => void remove(item)}
                    className="min-h-10 rounded-full border-2 border-ink bg-coral/30 px-4 text-sm font-bold"
                  >
                    删除
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </AdminFrame>
  );
}

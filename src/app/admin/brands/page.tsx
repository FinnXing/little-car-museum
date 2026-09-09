"use client";

import { FormEvent, useEffect, useState } from "react";
import { AdminFrame } from "@/components/admin/AdminFrame";
import type { Brand } from "@/types";

type AdminBrand = Brand & { _count?: { vehicles: number } };
type BrandForm = {
  slug: string;
  nameCn: string;
  nameEn: string;
  aliases: string;
  countryRegion: string;
  descriptionChild: string;
  logoUrl: string;
  isHot: boolean;
  sortOrder: string;
};

const emptyForm: BrandForm = {
  slug: "",
  nameCn: "",
  nameEn: "",
  aliases: "",
  countryRegion: "",
  descriptionChild: "",
  logoUrl: "",
  isHot: false,
  sortOrder: "0",
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

export default function AdminBrandsPage() {
  const [items, setItems] = useState<AdminBrand[]>([]);
  const [form, setForm] = useState<BrandForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setIsLoading(true);
    try {
      const response = await fetch("/api/v1/admin/brands");
      setItems((await readResponse(response)) as AdminBrand[]);
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

  function edit(item: AdminBrand) {
    setEditingId(item.id);
    setForm({
      slug: item.slug,
      nameCn: item.nameCn,
      nameEn: item.nameEn || "",
      aliases: item.aliases.join(", "),
      countryRegion: item.countryRegion || "",
      descriptionChild: item.descriptionChild || "",
      logoUrl: item.logoUrl || "",
      isHot: item.isHot,
      sortOrder: String(item.sortOrder),
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
          ? `/api/v1/admin/brands/${editingId}`
          : "/api/v1/admin/brands",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            ...form,
            aliases: form.aliases
              .split(",")
              .map((value) => value.trim())
              .filter(Boolean),
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

  async function remove(item: AdminBrand) {
    if (
      !window.confirm(
        `确认删除品牌“${item.nameCn}”吗？有关联汽车时删除会被拒绝。`,
      )
    ) {
      return;
    }
    try {
      const response = await fetch(`/api/v1/admin/brands/${item.id}`, {
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
      title="品牌管理"
      description="维护品牌认知卡和文字信息；真实品牌内容发布前必须完成素材授权审核。"
    >
      <section className="grid gap-8 lg:grid-cols-[minmax(18rem,0.7fr)_minmax(0,1.3fr)]">
        <form
          onSubmit={submit}
          className="grid content-start gap-4 rounded-[1.5rem] border-2 border-ink bg-card p-5"
        >
          <h2 className="font-display text-2xl font-black text-ink">
            {editingId ? "编辑品牌" : "新增品牌"}
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
            别名（逗号分隔）
            <input
              value={form.aliases}
              onChange={(event) =>
                setForm({ ...form, aliases: event.target.value })
              }
              className="min-h-11 rounded-xl border-2 border-ink bg-paper px-3 font-normal"
            />
          </label>
          <label className="grid gap-2 font-bold">
            国家或地区
            <input
              value={form.countryRegion}
              onChange={(event) =>
                setForm({ ...form, countryRegion: event.target.value })
              }
              className="min-h-11 rounded-xl border-2 border-ink bg-paper px-3 font-normal"
            />
          </label>
          <label className="grid gap-2 font-bold">
            儿童版简介
            <textarea
              value={form.descriptionChild}
              onChange={(event) =>
                setForm({ ...form, descriptionChild: event.target.value })
              }
              className="min-h-24 rounded-xl border-2 border-ink bg-paper px-3 py-2 font-normal"
            />
          </label>
          <label className="grid gap-2 font-bold">
            Logo 地址
            <input
              type="url"
              value={form.logoUrl}
              onChange={(event) =>
                setForm({ ...form, logoUrl: event.target.value })
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
              checked={form.isHot}
              onChange={(event) =>
                setForm({ ...form, isHot: event.target.checked })
              }
              className="size-5 accent-teal"
            />
            标记为热门品牌
          </label>
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className="min-h-11 rounded-full border-2 border-ink bg-teal px-5 font-bold disabled:opacity-60"
            >
              {isSaving ? "保存中…" : editingId ? "保存修改" : "新增品牌"}
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

        <section className="grid content-start gap-3" aria-live="polite">
          <h2 className="font-display text-2xl font-black text-ink">
            已有品牌
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
              还没有品牌。
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
                      {item.status}
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

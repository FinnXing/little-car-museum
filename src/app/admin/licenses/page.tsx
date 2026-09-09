"use client";

import { FormEvent, useEffect, useState } from "react";
import { AdminFrame } from "@/components/admin/AdminFrame";
import type { AssetLicense, AssetType, AssetReviewStatus } from "@/types";

type AdminLicense = AssetLicense & {
  _count?: { vehicles: number; brands: number };
};
type LicenseForm = {
  assetName: string;
  assetType: AssetType;
  authorName: string;
  sourcePageUrl: string;
  licenseName: string;
  licenseUrl: string;
  acquiredAt: string;
  allowPublicDisplay: boolean;
  allowModification: boolean;
  attributionRequired: boolean;
  attributionText: string;
  reviewStatus: AssetReviewStatus;
};

const emptyForm: LicenseForm = {
  assetName: "",
  assetType: "MODEL",
  authorName: "",
  sourcePageUrl: "",
  licenseName: "",
  licenseUrl: "",
  acquiredAt: "2026-09-09",
  allowPublicDisplay: false,
  allowModification: false,
  attributionRequired: false,
  attributionText: "",
  reviewStatus: "PENDING",
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

export default function AdminLicensesPage() {
  const [items, setItems] = useState<AdminLicense[]>([]);
  const [form, setForm] = useState<LicenseForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setIsLoading(true);
    try {
      const response = await fetch("/api/v1/admin/licenses");
      setItems((await readResponse(response)) as AdminLicense[]);
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

  function edit(item: AdminLicense) {
    setEditingId(item.id);
    setForm({
      assetName: item.assetName,
      assetType: item.assetType,
      authorName: item.authorName,
      sourcePageUrl: item.sourcePageUrl,
      licenseName: item.licenseName,
      licenseUrl: item.licenseUrl || "",
      acquiredAt: item.acquiredAt.slice(0, 10),
      allowPublicDisplay: item.allowPublicDisplay,
      allowModification: item.allowModification,
      attributionRequired: item.attributionRequired,
      attributionText: item.attributionText || "",
      reviewStatus: item.reviewStatus,
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
          ? `/api/v1/admin/licenses/${editingId}`
          : "/api/v1/admin/licenses",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(form),
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

  async function remove(item: AdminLicense) {
    if (
      !window.confirm(
        `确认删除许可证“${item.assetName}”吗？仍被引用时删除会被拒绝。`,
      )
    )
      return;
    try {
      const response = await fetch(`/api/v1/admin/licenses/${item.id}`, {
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
      title="许可证管理"
      description="记录每份模型、图片或音频素材的来源与授权；只有允许公开展示且审核通过的许可证才能支撑发布。"
    >
      <section className="grid gap-8 lg:grid-cols-[minmax(18rem,0.7fr)_minmax(0,1.3fr)]">
        <form
          onSubmit={submit}
          className="grid content-start gap-4 rounded-[1.5rem] border-2 border-ink bg-card p-5"
        >
          <h2 className="font-display text-2xl font-black text-ink">
            {editingId ? "编辑许可证" : "新增许可证"}
          </h2>
          <label className="grid gap-2 font-bold">
            素材名称
            <input
              required
              value={form.assetName}
              onChange={(event) =>
                setForm({ ...form, assetName: event.target.value })
              }
              className="min-h-11 rounded-xl border-2 border-ink bg-paper px-3 font-normal"
            />
          </label>
          <label className="grid gap-2 font-bold">
            素材类型
            <select
              value={form.assetType}
              onChange={(event) =>
                setForm({ ...form, assetType: event.target.value as AssetType })
              }
              className="min-h-11 rounded-xl border-2 border-ink bg-paper px-3 font-normal"
            >
              <option value="MODEL">模型</option>
              <option value="IMAGE">图片</option>
              <option value="TEXTURE">贴图</option>
              <option value="AUDIO">音频</option>
              <option value="LOGO">Logo</option>
            </select>
          </label>
          <label className="grid gap-2 font-bold">
            作者
            <input
              required
              value={form.authorName}
              onChange={(event) =>
                setForm({ ...form, authorName: event.target.value })
              }
              className="min-h-11 rounded-xl border-2 border-ink bg-paper px-3 font-normal"
            />
          </label>
          <label className="grid gap-2 font-bold">
            来源详情页
            <input
              required
              type="url"
              value={form.sourcePageUrl}
              onChange={(event) =>
                setForm({ ...form, sourcePageUrl: event.target.value })
              }
              className="min-h-11 rounded-xl border-2 border-ink bg-paper px-3 font-normal"
            />
          </label>
          <label className="grid gap-2 font-bold">
            许可证名称
            <input
              required
              value={form.licenseName}
              onChange={(event) =>
                setForm({ ...form, licenseName: event.target.value })
              }
              className="min-h-11 rounded-xl border-2 border-ink bg-paper px-3 font-normal"
            />
          </label>
          <label className="grid gap-2 font-bold">
            许可证地址
            <input
              type="url"
              value={form.licenseUrl}
              onChange={(event) =>
                setForm({ ...form, licenseUrl: event.target.value })
              }
              className="min-h-11 rounded-xl border-2 border-ink bg-paper px-3 font-normal"
            />
          </label>
          <label className="grid gap-2 font-bold">
            获取日期
            <input
              required
              type="date"
              value={form.acquiredAt}
              onChange={(event) =>
                setForm({ ...form, acquiredAt: event.target.value })
              }
              className="min-h-11 rounded-xl border-2 border-ink bg-paper px-3 font-normal"
            />
          </label>
          <label className="grid gap-2 font-bold">
            审核状态
            <select
              value={form.reviewStatus}
              onChange={(event) =>
                setForm({
                  ...form,
                  reviewStatus: event.target.value as AssetReviewStatus,
                })
              }
              className="min-h-11 rounded-xl border-2 border-ink bg-paper px-3 font-normal"
            >
              <option value="PENDING">待审核</option>
              <option value="APPROVED">已通过</option>
              <option value="REJECTED">已拒绝</option>
            </select>
          </label>
          <div className="grid gap-2">
            {(
              [
                "allowPublicDisplay",
                "allowModification",
                "attributionRequired",
              ] as const
            ).map((key) => {
              const labels = {
                allowPublicDisplay: "允许公开展示",
                allowModification: "允许修改",
                attributionRequired: "需要署名",
              };
              return (
                <label
                  key={key}
                  className="flex min-h-10 items-center gap-3 font-bold"
                >
                  <input
                    type="checkbox"
                    checked={form[key]}
                    onChange={(event) =>
                      setForm({ ...form, [key]: event.target.checked })
                    }
                    className="size-5 accent-teal"
                  />
                  {labels[key]}
                </label>
              );
            })}
          </div>
          <label className="grid gap-2 font-bold">
            署名文本
            <textarea
              value={form.attributionText}
              onChange={(event) =>
                setForm({ ...form, attributionText: event.target.value })
              }
              className="min-h-20 rounded-xl border-2 border-ink bg-paper px-3 py-2 font-normal"
            />
          </label>
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className="min-h-11 rounded-full border-2 border-ink bg-teal px-5 font-bold disabled:opacity-60"
            >
              {isSaving ? "保存中…" : editingId ? "保存修改" : "新增许可证"}
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
            已有许可证
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
              还没有许可证。
            </p>
          ) : (
            <div className="grid gap-3">
              {items.map((item) => (
                <article
                  key={item.id}
                  className="flex flex-wrap items-center gap-3 rounded-xl border-2 border-ink bg-card p-4"
                >
                  <div className="mr-auto grid gap-1">
                    <h3 className="font-bold text-ink">{item.assetName}</h3>
                    <p className="text-sm text-ink-muted">
                      {item.assetType} · {item.licenseName} ·{" "}
                      {item.reviewStatus} · {item._count?.vehicles ?? 0} 辆汽车
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

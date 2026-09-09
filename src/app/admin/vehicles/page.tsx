"use client";

import { FormEvent, useEffect, useState } from "react";
import { AdminFrame } from "@/components/admin/AdminFrame";
import type {
  Brand,
  Category,
  DisplayType,
  EnergyType,
  Vehicle,
} from "@/types";

type AdminVehicle = Vehicle & {
  brand?: Pick<Brand, "id" | "nameCn"> | null;
  categories?: Array<{
    categoryId: string;
    category?: Pick<Category, "nameCn">;
  }>;
};
type VehicleForm = {
  slug: string;
  nameCn: string;
  childDescription: string;
  brandId: string;
  categoryIds: string;
  displayType: DisplayType;
  energyType: EnergyType | "";
  coverImageUrl: string;
  highModelUrl: string;
  lowModelUrl: string;
  fallbackImageUrls: string;
  isRealModel: boolean;
  isHot: boolean;
  sortOrder: string;
};

const emptyForm: VehicleForm = {
  slug: "",
  nameCn: "",
  childDescription: "",
  brandId: "",
  categoryIds: "",
  displayType: "GENERIC_3D",
  energyType: "",
  coverImageUrl: "/placeholders/vehicle-placeholder.svg",
  highModelUrl: "",
  lowModelUrl: "",
  fallbackImageUrls: "/placeholders/vehicle-placeholder.svg",
  isRealModel: false,
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

function splitList(value: string) {
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export default function AdminVehiclesPage() {
  const [items, setItems] = useState<AdminVehicle[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [form, setForm] = useState<VehicleForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setIsLoading(true);
    try {
      const [vehicleResponse, categoryResponse, brandResponse] =
        await Promise.all([
          fetch("/api/v1/admin/vehicles"),
          fetch("/api/v1/admin/categories"),
          fetch("/api/v1/admin/brands"),
        ]);
      setItems((await readResponse(vehicleResponse)) as AdminVehicle[]);
      setCategories((await readResponse(categoryResponse)) as Category[]);
      setBrands((await readResponse(brandResponse)) as Brand[]);
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

  function edit(item: AdminVehicle) {
    setEditingId(item.id);
    setForm({
      slug: item.slug,
      nameCn: item.nameCn,
      childDescription: item.childDescription,
      brandId: item.brandId || "",
      categoryIds:
        item.categories?.map((entry) => entry.categoryId).join(", ") ||
        item.categoryIds.join(", "),
      displayType: item.displayType,
      energyType: item.energyType || "",
      coverImageUrl: item.coverImageUrl,
      highModelUrl: item.highModelUrl || "",
      lowModelUrl: item.lowModelUrl || "",
      fallbackImageUrls: item.fallbackImageUrls.join(", "),
      isRealModel: item.isRealModel,
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
          ? `/api/v1/admin/vehicles/${editingId}`
          : "/api/v1/admin/vehicles",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            ...form,
            brandId: form.brandId || null,
            categoryIds: splitList(form.categoryIds),
            fallbackImageUrls: splitList(form.fallbackImageUrls),
            energyType: form.energyType || undefined,
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

  async function action(
    item: AdminVehicle,
    endpoint: "publish" | "unpublish" | "archive",
  ) {
    setError(null);
    try {
      const response = await fetch(
        endpoint === "archive"
          ? `/api/v1/admin/vehicles/${item.id}`
          : `/api/v1/admin/vehicles/${item.id}/${endpoint}`,
        { method: endpoint === "archive" ? "DELETE" : "POST" },
      );
      await readResponse(response);
      await load();
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "操作失败。",
      );
    }
  }

  return (
    <AdminFrame
      title="汽车管理"
      description="编辑汽车基础内容与展示资源。发布前必须满足分类、资源和素材许可证校验。"
    >
      <section className="grid gap-8 lg:grid-cols-[minmax(20rem,0.8fr)_minmax(0,1.2fr)]">
        <form
          onSubmit={submit}
          className="grid content-start gap-4 rounded-[1.5rem] border-2 border-ink bg-card p-5"
        >
          <h2 className="font-display text-2xl font-black text-ink">
            {editingId ? "编辑汽车" : "新增汽车"}
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
            儿童版介绍
            <textarea
              required
              value={form.childDescription}
              onChange={(event) =>
                setForm({ ...form, childDescription: event.target.value })
              }
              className="min-h-24 rounded-xl border-2 border-ink bg-paper px-3 py-2 font-normal"
            />
          </label>
          <label className="grid gap-2 font-bold">
            品牌
            <select
              value={form.brandId}
              onChange={(event) =>
                setForm({ ...form, brandId: event.target.value })
              }
              className="min-h-11 rounded-xl border-2 border-ink bg-paper px-3 font-normal"
            >
              <option value="">通用汽车（无品牌）</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.nameCn}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 font-bold">
            分类 ID（逗号分隔）
            <input
              required
              value={form.categoryIds}
              onChange={(event) =>
                setForm({ ...form, categoryIds: event.target.value })
              }
              placeholder={categories.map((category) => category.id).join(", ")}
              className="min-h-11 rounded-xl border-2 border-ink bg-paper px-3 font-normal"
            />
          </label>
          <label className="grid gap-2 font-bold">
            展示类型
            <select
              value={form.displayType}
              onChange={(event) =>
                setForm({
                  ...form,
                  displayType: event.target.value as DisplayType,
                })
              }
              className="min-h-11 rounded-xl border-2 border-ink bg-paper px-3 font-normal"
            >
              <option value="GENERIC_3D">通用 3D</option>
              <option value="REAL_3D">真实 3D</option>
              <option value="IMAGE_SET">图片组</option>
              <option value="STATIC_IMAGE">静态图片</option>
            </select>
          </label>
          <label className="grid gap-2 font-bold">
            能源类型
            <select
              value={form.energyType}
              onChange={(event) =>
                setForm({
                  ...form,
                  energyType: event.target.value as VehicleForm["energyType"],
                })
              }
              className="min-h-11 rounded-xl border-2 border-ink bg-paper px-3 font-normal"
            >
              <option value="">未设置</option>
              <option value="FUEL">燃油</option>
              <option value="ELECTRIC">电动</option>
              <option value="HYBRID">混合动力</option>
              <option value="OTHER">其他</option>
            </select>
          </label>
          <label className="grid gap-2 font-bold">
            封面地址
            <input
              required
              value={form.coverImageUrl}
              onChange={(event) =>
                setForm({ ...form, coverImageUrl: event.target.value })
              }
              className="min-h-11 rounded-xl border-2 border-ink bg-paper px-3 font-normal"
            />
          </label>
          <label className="grid gap-2 font-bold">
            高清模型地址
            <input
              value={form.highModelUrl}
              onChange={(event) =>
                setForm({ ...form, highModelUrl: event.target.value })
              }
              className="min-h-11 rounded-xl border-2 border-ink bg-paper px-3 font-normal"
            />
          </label>
          <label className="grid gap-2 font-bold">
            低清模型地址
            <input
              value={form.lowModelUrl}
              onChange={(event) =>
                setForm({ ...form, lowModelUrl: event.target.value })
              }
              className="min-h-11 rounded-xl border-2 border-ink bg-paper px-3 font-normal"
            />
          </label>
          <label className="grid gap-2 font-bold">
            降级图片地址（逗号分隔）
            <input
              value={form.fallbackImageUrls}
              onChange={(event) =>
                setForm({ ...form, fallbackImageUrls: event.target.value })
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
          <label className="flex min-h-10 items-center gap-3 font-bold">
            <input
              type="checkbox"
              checked={form.isRealModel}
              onChange={(event) =>
                setForm({ ...form, isRealModel: event.target.checked })
              }
              className="size-5 accent-teal"
            />
            真实车型
          </label>
          <label className="flex min-h-10 items-center gap-3 font-bold">
            <input
              type="checkbox"
              checked={form.isHot}
              onChange={(event) =>
                setForm({ ...form, isHot: event.target.checked })
              }
              className="size-5 accent-teal"
            />
            热门汽车
          </label>
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className="min-h-11 rounded-full border-2 border-ink bg-teal px-5 font-bold disabled:opacity-60"
            >
              {isSaving ? "保存中…" : editingId ? "保存修改" : "新增汽车"}
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
            已有汽车
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
              还没有汽车。
            </p>
          ) : (
            <div className="grid gap-3">
              {items.map((item) => (
                <article
                  key={item.id}
                  className="grid gap-3 rounded-xl border-2 border-ink bg-card p-4"
                >
                  <div className="flex flex-wrap items-start gap-3">
                    <div className="mr-auto grid gap-1">
                      <h3 className="font-bold text-ink">{item.nameCn}</h3>
                      <p className="text-sm text-ink-muted">
                        {item.slug} · {item.status} ·{" "}
                        {item.categories
                          ?.map(
                            (entry) =>
                              entry.category?.nameCn || entry.categoryId,
                          )
                          .join("、") || "未加载分类"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => edit(item)}
                      className="min-h-10 rounded-full border-2 border-ink px-4 text-sm font-bold"
                    >
                      编辑
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void action(item, "publish")}
                      disabled={item.status === "PUBLISHED"}
                      className="min-h-10 rounded-full border-2 border-ink bg-teal/30 px-4 text-sm font-bold disabled:opacity-40"
                    >
                      发布
                    </button>
                    <button
                      type="button"
                      onClick={() => void action(item, "unpublish")}
                      disabled={item.status !== "PUBLISHED"}
                      className="min-h-10 rounded-full border-2 border-ink bg-sun px-4 text-sm font-bold disabled:opacity-40"
                    >
                      下架
                    </button>
                    <button
                      type="button"
                      onClick={() => void action(item, "archive")}
                      disabled={item.status === "ARCHIVED"}
                      className="min-h-10 rounded-full border-2 border-ink bg-coral/30 px-4 text-sm font-bold disabled:opacity-40"
                    >
                      归档
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </AdminFrame>
  );
}

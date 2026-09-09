"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { AdminFrame } from "@/components/admin/AdminFrame";
import type { AssetType } from "@/types";

type UploadedAsset = {
  id: string;
  originalName: string;
  safeName: string;
  assetType: AssetType;
  quality: string | null;
  mimeType: string;
  sizeBytes: number;
  checksumSha256: string;
  createdAt: string;
  publicUrl: string | null;
  downloadUrl: string;
  uploadedBy?: { displayName: string | null; email: string };
};

const labels: Record<AssetType, string> = {
  MODEL: "GLB 模型",
  IMAGE: "图片",
  TEXTURE: "贴图",
  AUDIO: "音频",
  LOGO: "Logo",
};

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

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

function uploadFile(
  file: File,
  assetType: AssetType,
  quality: "HIGH" | "LOW",
  onProgress: (progress: number) => void,
) {
  return new Promise<UploadedAsset>((resolve, reject) => {
    const request = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("assetType", assetType);
    if (assetType === "MODEL") formData.append("quality", quality);
    request.open("POST", "/api/v1/admin/assets/upload");
    request.upload.onprogress = (event) => {
      if (event.lengthComputable)
        onProgress(Math.round((event.loaded / event.total) * 100));
    };
    request.onerror = () =>
      reject(new Error("上传连接失败，请检查网络后重试。"));
    request.onabort = () => reject(new Error("上传已取消。"));
    request.onload = () => {
      let body: {
        success?: boolean;
        data?: UploadedAsset;
        error?: { message?: string };
      };
      try {
        body = JSON.parse(request.responseText) as typeof body;
      } catch {
        reject(new Error("服务器返回了无法识别的响应。"));
        return;
      }
      if (
        request.status < 200 ||
        request.status >= 300 ||
        !body.success ||
        !body.data
      ) {
        reject(new Error(body.error?.message || "上传失败，请稍后再试。"));
        return;
      }
      resolve(body.data);
    };
    request.send(formData);
  });
}

export default function AdminAssetsPage() {
  const [items, setItems] = useState<UploadedAsset[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [assetType, setAssetType] = useState<AssetType>("IMAGE");
  const [quality, setQuality] = useState<"HIGH" | "LOW">("HIGH");
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function load() {
    setIsLoading(true);
    try {
      const response = await fetch("/api/v1/admin/assets");
      setItems((await readResponse(response)) as UploadedAsset[]);
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

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      setError("请选择要上传的文件。");
      return;
    }
    setIsUploading(true);
    setProgress(0);
    setError(null);
    setSuccess(null);
    try {
      const uploaded = await uploadFile(file, assetType, quality, setProgress);
      setItems((current) => [uploaded, ...current]);
      setFile(null);
      setProgress(100);
      setSuccess(`上传完成：${uploaded.safeName}`);
      const input = document.getElementById(
        "asset-file",
      ) as HTMLInputElement | null;
      if (input) input.value = "";
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "上传失败，请重试。",
      );
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <AdminFrame
      title="素材上传"
      description="上传前会校验扩展名、MIME、文件头和大小；文件写入随机对象存储路径，并记录上传管理员与摘要。"
    >
      <section className="grid gap-8 lg:grid-cols-[minmax(20rem,0.7fr)_minmax(0,1.3fr)]">
        <form
          onSubmit={submit}
          className="grid content-start gap-4 rounded-[1.5rem] border-2 border-ink bg-card p-5"
        >
          <h2 className="font-display text-2xl font-black text-ink">
            上传文件
          </h2>
          <label className="grid gap-2 font-bold">
            素材类型
            <select
              value={assetType}
              onChange={(event) =>
                setAssetType(event.target.value as AssetType)
              }
              className="min-h-11 rounded-xl border-2 border-ink bg-paper px-3 font-normal"
            >
              {(Object.keys(labels) as AssetType[]).map((type) => (
                <option key={type} value={type}>
                  {labels[type]}
                </option>
              ))}
            </select>
          </label>
          {assetType === "MODEL" ? (
            <label className="grid gap-2 font-bold">
              模型清晰度
              <select
                value={quality}
                onChange={(event) =>
                  setQuality(event.target.value as "HIGH" | "LOW")
                }
                className="min-h-11 rounded-xl border-2 border-ink bg-paper px-3 font-normal"
              >
                <option value="HIGH">高清（最多 50MB）</option>
                <option value="LOW">低清（最多 20MB）</option>
              </select>
            </label>
          ) : null}
          <label className="grid gap-2 font-bold">
            文件
            <input
              id="asset-file"
              required
              type="file"
              accept={
                assetType === "MODEL"
                  ? ".glb"
                  : assetType === "AUDIO"
                    ? ".mp3,.m4a,.ogg,.wav"
                    : ".jpg,.jpeg,.png,.webp,.avif"
              }
              onChange={(event) => setFile(event.target.files?.[0] || null)}
              className="min-h-11 rounded-xl border-2 border-ink bg-paper px-3 py-2 font-normal"
            />
          </label>
          {isUploading ? (
            <div className="grid gap-2" aria-live="polite">
              <div className="flex justify-between text-sm font-bold">
                <span>上传进度</span>
                <span>{progress}%</span>
              </div>
              <progress
                value={progress}
                max="100"
                className="h-3 w-full accent-teal"
              />
            </div>
          ) : null}
          {error ? (
            <p
              role="alert"
              className="rounded-xl bg-coral/20 p-4 font-semibold"
            >
              {error}
            </p>
          ) : null}
          {success ? (
            <p
              role="status"
              className="rounded-xl bg-teal/20 p-4 font-semibold"
            >
              {success}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={isUploading}
            className="min-h-11 rounded-full border-2 border-ink bg-teal px-5 font-bold disabled:opacity-60"
          >
            {isUploading ? "上传中…" : "开始上传"}
          </button>
        </form>

        <section className="grid content-start gap-3" aria-live="polite">
          <h2 className="font-display text-2xl font-black text-ink">
            最近上传
          </h2>
          {isLoading ? (
            <p className="rounded-xl border-2 border-dashed border-ink/50 p-6 text-ink-muted">
              加载中…
            </p>
          ) : items.length === 0 ? (
            <p className="rounded-xl border-2 border-dashed border-ink/50 p-6 text-ink-muted">
              还没有上传文件。
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
                      <h3 className="font-bold text-ink">{item.safeName}</h3>
                      <p className="text-sm text-ink-muted">
                        {labels[item.assetType]}
                        {item.quality ? ` · ${item.quality}` : ""} ·{" "}
                        {formatSize(item.sizeBytes)}
                      </p>
                    </div>
                    <a
                      href={item.publicUrl || item.downloadUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="min-h-10 rounded-full border-2 border-ink bg-paper px-4 py-2 text-sm font-bold"
                    >
                      打开文件
                    </a>
                  </div>
                  <p className="break-all font-mono text-xs text-ink-muted">
                    SHA-256: {item.checksumSha256}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </AdminFrame>
  );
}

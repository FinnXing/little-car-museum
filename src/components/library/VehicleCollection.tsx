"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useSyncExternalStore } from "react";
import type { FavoriteRecord, HistoryRecord, Vehicle } from "@/types";
import {
  clearFavoriteRecords,
  clearHistoryRecords,
  getEmptySnapshot,
  getFavoritesSnapshot,
  getHistorySnapshot,
  replaceFavoriteRecords,
  replaceHistoryRecords,
  sanitizeFavoriteRecords,
  sanitizeHistoryRecords,
  subscribeToLocalLibrary,
} from "@/lib/client/local-library";

type CollectionKind = "favorites" | "history";

interface VehicleCollectionProps {
  kind: CollectionKind;
  vehicles: readonly Vehicle[];
}

function formatRecordDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "刚刚";
  return new Intl.DateTimeFormat("zh-CN", {
    month: "numeric",
    day: "numeric",
  }).format(date);
}

function CollectionCard({
  vehicle,
  timestamp,
  kind,
}: {
  vehicle: Vehicle;
  timestamp: string;
  kind: CollectionKind;
}) {
  return (
    <article className="overflow-hidden rounded-[1.75rem] border-2 border-ink bg-card">
      <Link href={`/cars/${vehicle.slug}`} className="group block">
        <div className="relative aspect-[16/9] overflow-hidden border-b-2 border-ink bg-mint-soft">
          <Image
            src={vehicle.coverImageUrl}
            alt={`${vehicle.nameCn}的汽车轮廓`}
            fill
            className="object-cover transition-transform duration-300 motion-reduce:transition-none supports-[hover:hover]:group-hover:scale-[1.03]"
            sizes="(max-width: 767px) calc(100vw - 32px), (max-width: 1199px) 50vw, 33vw"
          />
        </div>
        <div className="grid gap-2 p-5">
          <h2 className="font-display text-2xl font-black text-ink">
            {vehicle.nameCn}
          </h2>
          <p className="line-clamp-2 leading-7 text-ink-muted">
            {vehicle.childDescription}
          </p>
          <p className="text-sm font-bold text-teal">
            {kind === "favorites" ? "收藏于" : "最近看过"}{" "}
            {formatRecordDate(timestamp)} · 打开详情 →
          </p>
        </div>
      </Link>
    </article>
  );
}

export function VehicleCollection({ kind, vehicles }: VehicleCollectionProps) {
  const snapshot = useSyncExternalStore(
    subscribeToLocalLibrary,
    kind === "favorites" ? getFavoritesSnapshot : getHistorySnapshot,
    getEmptySnapshot,
  );
  const records = JSON.parse(snapshot) as Array<{
    vehicleId: string;
    createdAt?: string;
    viewedAt?: string;
  }>;
  const vehicleMap = useMemo(
    () => new Map(vehicles.map((vehicle) => [vehicle.id, vehicle])),
    [vehicles],
  );
  const validIds = useMemo(() => new Set(vehicleMap.keys()), [vehicleMap]);
  const visibleRecords = useMemo(() => {
    if (kind === "favorites") {
      return sanitizeFavoriteRecords(
        records.filter(
          (record): record is { vehicleId: string; createdAt: string } =>
            typeof record.createdAt === "string",
        ),
        validIds,
      );
    }
    return sanitizeHistoryRecords(
      records.filter(
        (record): record is { vehicleId: string; viewedAt: string } =>
          typeof record.viewedAt === "string",
      ),
      validIds,
    );
  }, [kind, records, validIds]);

  const storedRecordsMatchVisible = visibleRecords.length === records.length;
  useEffect(() => {
    if (storedRecordsMatchVisible) return;
    if (kind === "favorites") {
      replaceFavoriteRecords(visibleRecords as FavoriteRecord[]);
    } else {
      replaceHistoryRecords(visibleRecords as HistoryRecord[]);
    }
  }, [kind, storedRecordsMatchVisible, visibleRecords]);

  const clearRecords = () => {
    if (kind === "favorites") clearFavoriteRecords();
    else clearHistoryRecords();
  };
  const title = kind === "favorites" ? "我的收藏" : "最近浏览";
  const eyebrow = kind === "favorites" ? "Saved cars" : "Your little route";

  return (
    <section aria-labelledby={`${kind}-title`} className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-display text-sm font-black tracking-[0.18em] text-teal uppercase">
            {eyebrow}
          </p>
          <h1
            id={`${kind}-title`}
            className="mt-1 font-display text-4xl font-black text-ink sm:text-5xl"
          >
            {title}
          </h1>
        </div>
        {visibleRecords.length > 0 ? (
          <button
            type="button"
            onClick={clearRecords}
            className="min-h-12 rounded-full border-2 border-ink bg-card px-5 font-bold"
          >
            清空{kind === "favorites" ? "收藏" : "记录"}
          </button>
        ) : null}
      </div>

      {visibleRecords.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {visibleRecords.map((record) => {
            const vehicle = vehicleMap.get(record.vehicleId);
            if (!vehicle) return null;
            return (
              <CollectionCard
                key={record.vehicleId}
                vehicle={vehicle}
                kind={kind}
                timestamp={
                  kind === "favorites"
                    ? (record as FavoriteRecord).createdAt
                    : (record as HistoryRecord).viewedAt
                }
              />
            );
          })}
        </div>
      ) : (
        <div className="grid justify-items-start gap-5 rounded-[2rem] border-2 border-dashed border-ink/50 bg-card p-6 sm:p-10">
          <span className="text-5xl" aria-hidden="true">
            {kind === "favorites" ? "★" : "🛞"}
          </span>
          <div className="grid gap-2">
            <h2 className="font-display text-2xl font-black text-ink">
              {kind === "favorites" ? "还没有收藏汽车" : "还没有浏览记录"}
            </h2>
            <p className="text-lg leading-8 text-ink-muted">
              {kind === "favorites"
                ? "看到喜欢的汽车，就在详情页点一下星星。"
                : "打开一辆汽车，它就会出现在这里。"}
            </p>
          </div>
          <Link
            href="/cars"
            className="grid min-h-12 place-items-center rounded-full border-2 border-ink bg-ink px-6 font-bold text-paper"
          >
            去汽车展厅
          </Link>
        </div>
      )}
    </section>
  );
}

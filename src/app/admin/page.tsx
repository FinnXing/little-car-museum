import type { Metadata } from "next";
import Link from "next/link";
import { AdminFrame } from "@/components/admin/AdminFrame";

export const metadata: Metadata = {
  title: "管理后台 | 小小汽车馆",
  robots: { index: false, follow: false },
};

const resources = [
  {
    href: "/admin/categories",
    title: "分类管理",
    description: "维护分类名称、排序、启用状态，并查看关联汽车数量。",
  },
  {
    href: "/admin/brands",
    title: "品牌管理",
    description: "维护品牌文字卡、别名、热门状态和授权信息。",
  },
  {
    href: "/admin/vehicles",
    title: "汽车管理",
    description: "编辑展示内容、资源、颜色和热点，执行发布与下架。",
  },
  {
    href: "/admin/licenses",
    title: "许可证管理",
    description: "记录素材来源、许可证和公开展示审核状态。",
  },
  {
    href: "/admin/assets",
    title: "素材上传",
    description: "上传图片、GLB 和音频，查看校验结果与文件摘要。",
  },
] as const;

export default function AdminPage() {
  return (
    <AdminFrame
      title="内容管理后台"
      description="这里管理小小汽车馆的可公开内容。所有公开页面只读取已发布且通过素材审核的记录。"
    >
      <section aria-label="后台资源" className="grid gap-4 sm:grid-cols-2">
        {resources.map((resource) => (
          <Link
            key={resource.href}
            href={resource.href}
            className="grid min-h-40 gap-3 rounded-[1.5rem] border-2 border-ink bg-card p-6 shadow-[5px_5px_0_var(--color-ink)] transition-transform hover:-translate-y-1"
          >
            <h2 className="font-display text-2xl font-black text-ink">
              {resource.title}
            </h2>
            <p className="leading-7 text-ink-muted">{resource.description}</p>
            <span className="font-bold text-teal">进入管理 →</span>
          </Link>
        ))}
      </section>
    </AdminFrame>
  );
}

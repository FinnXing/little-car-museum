import type { Metadata } from "next";
import { ViewerDemo } from "./ViewerDemo";

export const metadata: Metadata = {
  title: "3D 观察台原型 | 小小汽车馆",
  description: "小小汽车馆独立 3D 查看器原型。",
  robots: { index: false, follow: false },
};

export default function ViewerPrototypePage() {
  return <ViewerDemo />;
}

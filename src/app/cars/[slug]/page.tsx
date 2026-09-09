import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { VehicleDetail } from "@/components/car/VehicleDetail";
import { mockCategories, mockVehicles } from "@/lib/data/mock-vehicles";
import type { Vehicle } from "@/types";

interface VehicleDetailPageProps {
  params: Promise<{ slug: string }>;
}

function findVehicle(slug: string) {
  const vehicle: Vehicle | undefined = mockVehicles.find(
    (candidate) => candidate.slug === slug,
  );
  if (!vehicle) return null;
  if (
    process.env.NODE_ENV !== "development" &&
    vehicle.status !== "PUBLISHED"
  ) {
    return null;
  }
  return vehicle;
}

export async function generateMetadata({
  params,
}: VehicleDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const vehicle = findVehicle(slug);
  if (!vehicle) {
    return {
      title: "汽车详情 | 小小汽车馆",
      robots: { index: false, follow: false },
    };
  }
  return {
    title: `${vehicle.nameCn} 3D 展示｜小小汽车馆`,
    description: vehicle.childDescription,
    robots: { index: false, follow: false },
  };
}

export default async function VehicleDetailPage({
  params,
}: VehicleDetailPageProps) {
  const { slug } = await params;
  const vehicle = findVehicle(slug);
  if (!vehicle) notFound();

  return <VehicleDetail vehicle={vehicle} categories={mockCategories} />;
}

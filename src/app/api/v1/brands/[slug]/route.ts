import { getPublicBrandBySlug } from "@/lib/api/public";
import { apiSuccess, notFound, withApiErrors } from "@/lib/api/response";

interface BrandRouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(_request: Request, { params }: BrandRouteContext) {
  return withApiErrors(async () => {
    const { slug } = await params;
    const brand = await getPublicBrandBySlug(slug);
    if (!brand) throw notFound("没有找到这家汽车品牌。");
    return apiSuccess(brand);
  });
}

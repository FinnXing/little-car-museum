import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const PLACEHOLDER_IMAGE = "/placeholders/vehicle-placeholder.svg";
const SEED_TIMESTAMP = new Date("2026-09-08T00:00:00.000Z");

const categories = [
  {
    id: "seed-category-sedan",
    slug: "sedan",
    nameCn: "轿车",
    nameEn: "Sedan",
    sortOrder: 1,
  },
  {
    id: "seed-category-suv",
    slug: "suv",
    nameCn: "SUV",
    nameEn: "SUV",
    sortOrder: 2,
  },
  {
    id: "seed-category-sports-car",
    slug: "sports-car",
    nameCn: "跑车",
    nameEn: "Sports Car",
    sortOrder: 3,
  },
  {
    id: "seed-category-pickup",
    slug: "pickup",
    nameCn: "皮卡",
    nameEn: "Pickup",
    sortOrder: 4,
  },
] as const;

const vehicles = [
  {
    id: "seed-vehicle-red-sports-car",
    slug: "placeholder-red-lightning-sports-car",
    categorySlugs: ["sports-car"],
    nameCn: "红色闪电跑车",
    nameEn: "Red Lightning Sports Car",
    childName: "红色闪电",
    aliases: ["红色跑车"],
    displayType: "GENERIC_3D",
    isRealModel: false,
    energyType: "OTHER",
    seatCount: 2,
    childDescription: "这是一辆车身低低的通用跑车，看起来像准备向前冲。",
    colors: [
      {
        nameCn: "展示红",
        colorValue: "#E85D4A",
        materialNames: ["body_paint"],
        isOfficialColor: false,
        sortOrder: 1,
      },
    ],
    sortOrder: 1,
  },
  {
    id: "seed-vehicle-blue-sedan",
    slug: "placeholder-blue-city-sedan",
    categorySlugs: ["sedan"],
    nameCn: "蓝色城市轿车",
    nameEn: "Blue City Sedan",
    childName: "蓝蓝城市车",
    aliases: ["蓝色轿车"],
    displayType: "GENERIC_3D",
    isRealModel: false,
    energyType: "FUEL",
    seatCount: 5,
    childDescription: "这是一辆通用轿车，车身平稳，适合认识常见的汽车外形。",
    colors: [],
    sortOrder: 2,
  },
  {
    id: "seed-vehicle-green-suv",
    slug: "placeholder-green-adventure-suv",
    categorySlugs: ["suv"],
    nameCn: "绿色探险 SUV",
    nameEn: "Green Adventure SUV",
    childName: "绿色探险家",
    aliases: ["绿色越野风汽车"],
    displayType: "GENERIC_3D",
    isRealModel: false,
    energyType: "HYBRID",
    seatCount: 5,
    childDescription: "这是一辆高高的通用 SUV，宽大的车身看起来很有力量。",
    colors: [],
    sortOrder: 3,
  },
  {
    id: "seed-vehicle-yellow-pickup",
    slug: "placeholder-yellow-helper-pickup",
    categorySlugs: ["pickup"],
    nameCn: "黄色帮手皮卡",
    nameEn: "Yellow Helper Pickup",
    childName: "黄色小帮手",
    aliases: ["黄色皮卡"],
    displayType: "GENERIC_3D",
    isRealModel: false,
    energyType: "FUEL",
    seatCount: 5,
    childDescription:
      "这是一辆带开放式货斗的通用皮卡，可以帮助认识车厢和货斗。",
    colors: [],
    sortOrder: 4,
  },
  {
    id: "seed-vehicle-white-electric-sedan",
    slug: "placeholder-white-electric-sedan",
    categorySlugs: ["sedan"],
    nameCn: "白色电动轿车",
    nameEn: "White Electric Sedan",
    childName: "白色电力号",
    aliases: ["白色新能源车"],
    tags: ["新能源"],
    displayType: "GENERIC_3D",
    isRealModel: false,
    energyType: "ELECTRIC",
    seatCount: 5,
    childDescription: "这是一辆使用电能的通用轿车，可以帮助认识新能源汽车。",
    colors: [],
    sortOrder: 5,
  },
] as const;

async function main() {
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      create: {
        ...category,
        createdAt: SEED_TIMESTAMP,
        updatedAt: SEED_TIMESTAMP,
      },
      update: {
        nameCn: category.nameCn,
        nameEn: category.nameEn,
        sortOrder: category.sortOrder,
        enabled: true,
      },
    });
  }

  for (const vehicle of vehicles) {
    const { categorySlugs, colors, ...vehicleData } = vehicle;
    const aliases = [...vehicle.aliases];
    const tags = "tags" in vehicle ? [...vehicle.tags] : [];
    const normalizedVehicleData = {
      ...vehicleData,
      aliases,
      tags,
      coverImageUrl: PLACEHOLDER_IMAGE,
    };
    const categoryConnections = categorySlugs.map((categorySlug) => ({
      category: { connect: { slug: categorySlug } },
    }));
    const colorData = colors.map((color) => ({
      ...color,
      materialNames: [...color.materialNames],
    }));

    await prisma.vehicle.upsert({
      where: { slug: vehicle.slug },
      create: {
        ...normalizedVehicleData,
        fallbackImageUrls: [PLACEHOLDER_IMAGE],
        status: "DRAFT",
        categories: { create: categoryConnections },
        colors: { create: colorData },
        createdAt: SEED_TIMESTAMP,
        updatedAt: SEED_TIMESTAMP,
      },
      update: {
        ...normalizedVehicleData,
        fallbackImageUrls: [PLACEHOLDER_IMAGE],
        status: "DRAFT",
        categories: {
          deleteMany: {},
          create: categoryConnections,
        },
        colors: {
          deleteMany: {},
          create: colorData,
        },
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exitCode = 1;
  });

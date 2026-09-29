import { prisma } from "./lib/db";
import { hashPassword } from "./lib/security";

async function seed() {
  console.log("🌱 Seeding database...");

  // Demo seller
  const sellerPw = await hashPassword("seller123");
  const seller = await prisma.user.upsert({
    where: { email: "seller@trishulan.com" },
    update: {},
    create: {
      name:             "Vikramaditya Singh",
      email:            "seller@trishulan.com",
      role:             "SELLER",
      authProvider:     "JWT",
      passwordHash:     sellerPw,
      companyName:      "Apex Machinery Works",
      phone:            "+91 98765 43210",
      gstNumber:        "27AAAAA0000A1Z5",
      industrySector:   "MACHINERY",
      city:             "Rajkot",
      state:            "Gujarat",
      verifiedSeller:   true,
      subscriptionTier: "GROWTH",
    },
  });

  // Demo buyer
  const buyerPw = await hashPassword("buyer123");
  const buyer = await prisma.user.upsert({
    where: { email: "buyer@trishulan.com" },
    update: {},
    create: {
      name:             "Rahul Mehta",
      email:            "buyer@trishulan.com",
      role:             "BUYER",
      authProvider:     "JWT",
      passwordHash:     buyerPw,
      companyName:      "Global Infra Solutions",
      phone:            "+91 91234 56789",
      gstNumber:        "29BBBBB1111B1Z5",
      industrySector:   "RAW_MATERIALS",
      city:             "Mumbai",
      state:            "Maharashtra",
      subscriptionTier: "BASIC",
    },
  });

  // Listings
  await prisma.listing.createMany({
    skipDuplicates: true,
    data: [
      {
        title:            "TMT Steel Rebar Fe-500D (12mm)",
        description:      "High tensile strength primary steel rebar under BIS certification. For heavy infrastructure.",
        category:         "RAW_MATERIALS",
        price:            54500,
        unit:             "Metric Ton",
        location:         "Mumbai, Maharashtra",
        sellerId:         seller.id,
        sellerName:       "Jindal Steel & Power Supplies",
        isVerifiedSeller: true,
        imagePath:        "/Bento Box/RawMaterial.png",
      },
      {
        title:            "Automatic CNC 5-Axis Milling Center",
        description:      "High-precision industrial CNC machine with Siemens controller for complex metal components.",
        category:         "MACHINERY",
        price:            2850000,
        unit:             "Unit",
        location:         "Rajkot, Gujarat",
        sellerId:         seller.id,
        sellerName:       "Apex Machinery Works",
        isVerifiedSeller: true,
        imagePath:        "/Bento Box/Machinery.png",
      },
    ],
  });

  // RFQ
  await prisma.rFQ.create({
    data: {
      buyerId:     buyer.id,
      buyerName:   "Global Infra Solutions",
      title:       "Bulk Requirement: 50 MT Structural Steel Pipes",
      category:    "RAW_MATERIALS",
      quantity:    "50 MT",
      targetPrice: 52000,
      details:     "Urgent requirement for Grade A ERW steel pipes for water pipeline project in Vizag.",
      status:      "OPEN",
    },
  });

  console.log("✅ Seed complete!");
  console.log(`   Seller → seller@trishulan.com / seller123`);
  console.log(`   Buyer  → buyer@trishulan.com  / buyer123`);
  await prisma.$disconnect();
}

seed().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});

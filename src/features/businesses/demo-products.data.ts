import type {
  BusinessProduct,
  BusinessProductCategory,
  ProductDetail,
} from "./business.types";

export type DemoProductTemplate = {
  slug: string;
  name: string;
  short_description: string;
  description: string;
  price_type?: "fixed" | "starts_from" | "range" | "ask";
  price: string;
  max_price?: string | null;
  original_price?: string | null;
  category: string;
  image: string;
  images?: string[];
  variants?: BusinessProduct["variants"];
  custom_fields?: ProductDetail["custom_fields"];
  bestseller?: boolean;
};

export type DemoCatalog = {
  categoryMatchers: string[];
  categories: BusinessProductCategory[];
  products: DemoProductTemplate[];
};

export const demoCatalogs: DemoCatalog[] = [
  {
    categoryMatchers: [],
    categories: [
      demoCategory(101, "medicines", "Medicines"),
      demoCategory(102, "wellness", "Wellness"),
      demoCategory(103, "personal-care", "Personal Care"),
    ],
    products: [
      demoProduct({
        slug: "paracetamol-500-tablets",
        name: "Paracetamol 500mg Tablets",
        short_description: "10 tablet strip for fever and mild pain relief.",
        description: "A common over-the-counter fever and pain relief tablet. Use as directed by a qualified professional.",
        price: "24",
        original_price: "30",
        category: "medicines",
        image: "/images/default.jpg",
        images: [
          "/images/default.jpg",
        ],
        bestseller: true,
        variants: [
          { name: "Pack size", type: "text", values: [{ value: "10 tablets" }, { value: "20 tablets" }] },
        ],
        custom_fields: [
          { title: "Brand", value: "Demo Pharma" },
          { title: "Form", value: "Tablet" },
          { title: "Prescription required", value: "No" },
        ],
      }),
      demoProduct({ slug: "vitamin-c-zinc-tablets", name: "Vitamin C + Zinc Tablets", short_description: "Daily immunity support supplement.", description: "Effervescent vitamin C and zinc supplement for general wellness routines.", price: "179", original_price: "220", category: "wellness", image: "/images/default.jpg" }),
      demoProduct({ slug: "digital-thermometer", name: "Digital Thermometer", short_description: "Fast digital temperature reading.", description: "Compact digital thermometer with clear display for home temperature checks.", price_type: "starts_from", price: "199", original_price: "299", category: "wellness", image: "/images/default.jpg", bestseller: true }),
      demoProduct({ slug: "antiseptic-liquid", name: "Antiseptic Liquid", short_description: "Multipurpose antiseptic liquid, 500 ml.", description: "Useful for basic hygiene, surface cleaning, and first-aid routines as instructed on label.", price: "155", original_price: "180", category: "personal-care", image: "/images/default.jpg" }),
      demoProduct({ slug: "oral-rehydration-salts", name: "ORS Sachets", short_description: "Pack of 5 oral rehydration sachets.", description: "Oral rehydration salts for fluid and electrolyte replacement.", price: "60", original_price: null, category: "medicines", image: "/images/default.jpg" }),
      demoProduct({ slug: "blood-pressure-monitor", name: "Digital BP Monitor", short_description: "Automatic blood pressure monitor.", description: "Upper-arm automatic BP monitor with memory support for home readings.", price_type: "range", price: "1499", max_price: "2499", original_price: null, category: "wellness", image: "/images/default.jpg", bestseller: true }),
      demoProduct({ slug: "hand-sanitizer-500ml", name: "Hand Sanitizer 500ml", short_description: "Alcohol-based hand sanitizer.", description: "Quick-dry sanitizer for everyday hand hygiene.", price: "120", original_price: "160", category: "personal-care", image: "/images/default.jpg" }),
      demoProduct({ slug: "cough-syrup-adult", name: "Adult Cough Syrup", short_description: "Relief syrup for dry cough.", description: "Demo cough syrup listing. Consult the pharmacy before use.", price_type: "ask", price: "0", original_price: null, category: "medicines", image: "/images/default.jpg" }),
      demoProduct({ slug: "multivitamin-capsules", name: "Multivitamin Capsules", short_description: "30 capsule bottle for daily nutrition support.", description: "A balanced multivitamin supplement for daily wellness needs.", price: "349", original_price: "425", category: "wellness", image: "/images/default.jpg" }),
      demoProduct({ slug: "first-aid-kit", name: "First Aid Kit", short_description: "Compact emergency first aid kit.", description: "Includes common first-aid essentials for homes, shops, and travel.", price: "499", original_price: "650", category: "personal-care", image: "/images/default.jpg" }),
    ],
  },
  //For clothing store
  {
    categoryMatchers: [],
    categories: [
      demoCategory(201, "men-clothing", "Men's Clothing"),
      demoCategory(202, "women-clothing", "Women's Clothing"),
      demoCategory(203, "kids-clothing", "Kids' Clothing"),
    ],
    products: [
      demoProduct({
        slug: "women-cotton-kurti",
        name: "Women's Cotton Kurti",
        short_description: "Comfortable cotton kurti for daily and casual wear.",
        description:
          "Soft and breathable women's cotton kurti suitable for everyday wear, casual outings, and festive occasions.",
        price_type: "range",
        price: "699",
        max_price: "1299",
        original_price: "899",
        category: "women-clothing",
        image: "/images/demo-products/clothing/kurti_1.png",
        images: [
          "/images/demo-products/clothing/kurti_2.png",
          "/images/demo-products/clothing/kurti_3.png",
          "/images/demo-products/clothing/kurti_4.png",
          "/images/demo-products/clothing/kurti_5.png",
        ],
        bestseller: true,
        variants: [
          {
            name: "Size",
            type: "text",
            values: [
              { value: "S" },
              { value: "M" },
              { value: "L" },
              { value: "XL" },
            ],
          },
          {
            name: "Color",
            type: "color",
            values: [
              { value: "Red" },
              { value: "Blue" },
              { value: "Green" },
            ],
          },
        ],
        custom_fields: [
          { title: "Material", value: "Cotton" },
          { title: "Fit", value: "Regular Fit" },
          { title: "Occasion", value: "Casual" },
        ],
      }),

      demoProduct({
        slug: "printed-saree",
        name: "Printed Saree",
        short_description: "Elegant printed saree for casual and festive occasions.",
        description:
          "Lightweight printed saree with a comfortable drape, suitable for everyday wear, functions, and festive occasions.",
        price_type: "starts_from",
        price: "899",
        original_price: "1199",
        category: "women-clothing",
        image: "/images/default.jpg",
        bestseller: true,
        variants: [
          {
            name: "Color",
            type: "color",
            values: [
              { value: "Red" },
              { value: "Blue" },
              { value: "Pink" },
            ],
          },
        ],
        custom_fields: [
          { title: "Material", value: "Synthetic Blend" },
          { title: "Length", value: "6.3 metres" },
          { title: "Blouse Piece", value: "Included" },
        ],
      }),

      demoProduct({
        slug: "mens-casual-shirt",
        name: "Men's Casual Shirt",
        short_description: "Regular-fit casual shirt for everyday wear.",
        description:
          "Comfortable men's casual shirt designed for daily wear, office casuals, and weekend outings.",
        price: "799",
        original_price: "999",
        category: "men-clothing",
        image: "/images/default.jpg",
        bestseller: true,
        variants: [
          {
            name: "Size",
            type: "text",
            values: [
              { value: "M" },
              { value: "L" },
              { value: "XL" },
              { value: "XXL" },
            ],
          },
          {
            name: "Color",
            type: "color",
            values: [
              { value: "Blue" },
              { value: "White" },
              { value: "Black" },
            ],
          },
        ],
        custom_fields: [
          { title: "Material", value: "Cotton Blend" },
          { title: "Sleeve", value: "Full Sleeve" },
          { title: "Fit", value: "Regular Fit" },
        ],
      }),

      demoProduct({
        slug: "mens-round-neck-tshirt",
        name: "Men's Round Neck T-Shirt",
        short_description: "Soft cotton round-neck t-shirt for casual wear.",
        description:
          "Simple and comfortable men's round-neck t-shirt suitable for everyday casual styling.",
        price: "399",
        original_price: "499",
        category: "men-clothing",
        image: "/images/default.jpg",
        variants: [
          {
            name: "Size",
            type: "text",
            values: [
              { value: "S" },
              { value: "M" },
              { value: "L" },
              { value: "XL" },
            ],
          },
          {
            name: "Color",
            type: "color",
            values: [
              { value: "Black" },
              { value: "White" },
              { value: "Navy" },
            ],
          },
        ],
        custom_fields: [
          { title: "Material", value: "Cotton" },
          { title: "Neck", value: "Round Neck" },
          { title: "Sleeve", value: "Half Sleeve" },
        ],
      }),

      demoProduct({
        slug: "mens-slim-fit-jeans",
        name: "Men's Slim Fit Jeans",
        short_description: "Classic slim-fit denim jeans for everyday wear.",
        description:
          "Versatile men's denim jeans with a slim fit, suitable for casual and semi-casual outfits.",
        price: "999",
        original_price: "1299",
        category: "men-clothing",
        image: "/images/default.jpg",
        bestseller: true,
        variants: [
          {
            name: "Waist",
            type: "text",
            values: [
              { value: "30" },
              { value: "32" },
              { value: "34" },
              { value: "36" },
            ],
          },
          {
            name: "Color",
            type: "color",
            values: [
              { value: "Blue" },
              { value: "Black" },
            ],
          },
        ],
        custom_fields: [
          { title: "Material", value: "Denim" },
          { title: "Fit", value: "Slim Fit" },
          { title: "Rise", value: "Mid Rise" },
        ],
      }),

      demoProduct({
        slug: "women-western-dress",
        name: "Women's Western Dress",
        short_description: "Stylish women's dress for casual outings and parties.",
        description:
          "Modern western-style dress designed for casual outings, parties, and everyday fashion.",
        price_type: "range",
        price: "1199",
        max_price: "1899",
        original_price: "1499",
        category: "women-clothing",
        image: "/images/default.jpg",
        variants: [
          {
            name: "Size",
            type: "text",
            values: [
              { value: "S" },
              { value: "M" },
              { value: "L" },
              { value: "XL" },
            ],
          },
          {
            name: "Color",
            type: "color",
            values: [
              { value: "Black" },
              { value: "Red" },
              { value: "Pink" },
            ],
          },
        ],
        custom_fields: [
          { title: "Material", value: "Polyester Blend" },
          { title: "Length", value: "Knee Length" },
          { title: "Occasion", value: "Casual / Party" },
        ],
      }),

      demoProduct({
        slug: "women-palazzo-pants",
        name: "Women's Palazzo Pants",
        short_description: "Comfortable wide-leg palazzo pants for daily wear.",
        description:
          "Lightweight women's palazzo pants designed for comfortable everyday and casual styling.",
        price: "499",
        original_price: "699",
        category: "women-clothing",
        image: "/images/default.jpg",
        variants: [
          {
            name: "Size",
            type: "text",
            values: [
              { value: "S" },
              { value: "M" },
              { value: "L" },
              { value: "XL" },
            ],
          },
          {
            name: "Color",
            type: "color",
            values: [
              { value: "Black" },
              { value: "Beige" },
              { value: "Maroon" },
            ],
          },
        ],
        custom_fields: [
          { title: "Material", value: "Rayon Blend" },
          { title: "Fit", value: "Relaxed Fit" },
          { title: "Style", value: "Wide Leg" },
        ],
      }),

      demoProduct({
        slug: "boys-casual-shirt",
        name: "Boys' Casual Shirt",
        short_description: "Comfortable casual shirt for boys.",
        description:
          "Stylish and comfortable boys' shirt suitable for outings, celebrations, and everyday wear.",
        price: "549",
        original_price: "699",
        category: "kids-clothing",
        image: "/images/default.jpg",
        variants: [
          {
            name: "Age",
            type: "text",
            values: [
              { value: "4-5 Years" },
              { value: "6-7 Years" },
              { value: "8-9 Years" },
              { value: "10-11 Years" },
            ],
          },
        ],
        custom_fields: [
          { title: "Material", value: "Cotton Blend" },
          { title: "Sleeve", value: "Full Sleeve" },
          { title: "Fit", value: "Regular Fit" },
        ],
      }),

      demoProduct({
        slug: "girls-party-dress",
        name: "Girls' Party Dress",
        short_description: "Stylish party dress for girls.",
        description:
          "Beautiful girls' party dress suitable for birthdays, celebrations, and festive occasions.",
        price_type: "ask",
        price: "0",
        original_price: null,
        category: "kids-clothing",
        image: "/images/default.jpg",
        bestseller: true,
        variants: [
          {
            name: "Age",
            type: "text",
            values: [
              { value: "3-4 Years" },
              { value: "5-6 Years" },
              { value: "7-8 Years" },
              { value: "9-10 Years" },
            ],
          },
          {
            name: "Color",
            type: "color",
            values: [
              { value: "Pink" },
              { value: "Blue" },
              { value: "Red" },
            ],
          },
        ],
        custom_fields: [
          { title: "Material", value: "Net Blend" },
          { title: "Occasion", value: "Party / Festive" },
          { title: "Length", value: "Knee Length" },
        ],
      }),

      demoProduct({
        slug: "mens-kurta",
        name: "Men's Traditional Kurta",
        short_description: "Traditional men's kurta for festive occasions.",
        description:
          "Comfortable traditional kurta suitable for festivals, family occasions, puja, and celebrations.",
        price: "1099",
        original_price: "1399",
        category: "men-clothing",
        image: "/images/default.jpg",
        variants: [
          {
            name: "Size",
            type: "text",
            values: [
              { value: "M" },
              { value: "L" },
              { value: "XL" },
              { value: "XXL" },
            ],
          },
          {
            name: "Color",
            type: "color",
            values: [
              { value: "White" },
              { value: "Yellow" },
              { value: "Maroon" },
            ],
          },
        ],
        custom_fields: [
          { title: "Material", value: "Cotton Blend" },
          { title: "Sleeve", value: "Full Sleeve" },
          { title: "Occasion", value: "Festive / Traditional" },
        ],
      }),
    ],
  },
];

function demoCategory(id: number, slug: string, displayName: string): BusinessProductCategory {
  return {
    id,
    name: slug,
    label: displayName,
    slug,
    type: "product",
    display_name: displayName,
    image: null,
  };
}

function demoProduct(product: DemoProductTemplate): DemoProductTemplate {
  return product;
}

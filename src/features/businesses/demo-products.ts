import type {
  BusinessNameDetail,
  BusinessProduct,
  BusinessProducts,
  BusinessProductsListResponse,
  ProductDetail,
} from "./business.types";
import { demoCatalogs, type DemoCatalog, type DemoProductTemplate } from "./demo-products.data";

type DemoBusinessContext = {
  id: string;
  name: string;
  handle: string;
  slug: string;
  media: { thumbnail: string | null };
  location: {
    locality: string;
    city: ProductDetail["business"]["city"];
  };
};

export function getDemoBusinessProducts(business: BusinessNameDetail, categorySlug?: string): BusinessProducts | null {
  const catalog = getDemoCatalogForBusiness(business);
  if (!catalog) return null;
  const products = materializeDemoProducts(catalog, business, categorySlug);
  return { categories: catalog.categories, items: products };
}

export function getDemoBusinessProductsPage(business: BusinessNameDetail, categorySlug?: string): BusinessProductsListResponse | null {
  const catalog = getDemoCatalogForBusiness(business);
  if (!catalog) return null;
  const products = materializeDemoProducts(catalog, business, categorySlug);
  return {
    business: { id: business.id, name: business.name, slug: business.slug },
    categories: catalog.categories,
    pagination: {
      page: 1,
      page_size: products.length,
      total_pages: 1,
      total_items: products.length,
      has_next: false,
      has_previous: false,
    },
    results: products,
  };
}

export function getDemoProductBusinessSlug(slug: string) {
  return getDemoProductMatch(slug)?.businessSlug ?? null;
}

export function getDemoProductBySlug(slug: string, business?: BusinessNameDetail): ProductDetail | null {
  const match = getDemoProductMatch(slug);
  if (!match) return null;
  const { catalog, template, businessSlug } = match;
  const businessContext = business ? businessToDemoContext(business) : fallbackDemoBusiness(businessSlug);
  const category = catalog.categories.find((item) => item.slug === template.category) ?? catalog.categories[0];
  return {
    ...materializeDemoProduct(template, businessContext),
    type: "product",
    description: template.description,
    variants: template.variants ?? [],
    specifications: { is_bargain: false, is_available: true, is_bestseller: template.bestseller === true },
    custom_fields: template.custom_fields ?? [
      { title: "Availability", value: "In stock" },
      { title: "Product type", value: category.name || category.display_name || category.label },
    ],
    categories: [category],
    images: [
      ...(template.images ?? [template.image]).map((image, index) => ({
        image,
        alt_text: template.name,
        is_primary: index === 0,
        sort_order: index,
      })),
    ],
    business: {
      id: businessContext.id,
      name: businessContext.name,
      handle: businessContext.handle,
      slug: businessContext.slug,
      thumbnail: businessContext.media.thumbnail,
      locality: businessContext.location.locality,
      city: businessContext.location.city,
    },
  };
}

function getDemoCatalogForBusiness(business: BusinessNameDetail) {
  const categoryTokens = (business.categories ?? []).flatMap((category) => [category.slug, category.display_name]);
  return demoCatalogs.find((catalog) =>
    catalog.categoryMatchers.some((matcher) =>
      categoryTokens.some((token) => normalize(token).includes(normalize(matcher))),
    ),
  );
}

function materializeDemoProducts(catalog: DemoCatalog, business: BusinessNameDetail, categorySlug?: string) {
  const businessContext = businessToDemoContext(business);
  return catalog.products
    .filter((product) => !categorySlug || product.category === categorySlug)
    .map((product) => materializeDemoProduct(product, businessContext));
}

function materializeDemoProduct(product: DemoProductTemplate, business: DemoBusinessContext): BusinessProduct {
  return {
    id: `demo-${business.id}-${product.slug}`,
    name: product.name,
    slug: `demo-${business.slug}-${product.slug}`,
    short_description: product.short_description,
    price_type: product.price_type ?? "fixed",
    price: product.price,
    max_price: product.max_price ?? null,
    original_price: product.original_price ?? null,
    categories: null,
    variants: product.variants ?? [],
    specifications: { is_bargain: false, is_available: true, is_bestseller: product.bestseller === true },
    is_featured: product.bestseller === true,
    primary_image: product.image,
  };
}

function getDemoProductMatch(slug: string) {
  if (!slug.startsWith("demo-")) return null;
  for (const catalog of demoCatalogs) {
    for (const template of catalog.products) {
      const suffix = `-${template.slug}`;
      if (slug.endsWith(suffix)) {
        const businessSlug = slug.slice("demo-".length, -suffix.length);
        if (businessSlug) return { catalog, template, businessSlug };
      }
    }
  }
  return null;
}

function businessToDemoContext(business: BusinessNameDetail): DemoBusinessContext {
  return {
    id: business.id,
    name: business.name,
    handle: business.handle,
    slug: business.slug,
    media: business.media,
    location: {
      locality: business.location.locality,
      city: business.location.city,
    },
  };
}

function fallbackDemoBusiness(slug: string): DemoBusinessContext {
  return {
    id: `demo-business-${slug}`,
    name: labelFromSlug(slug),
    handle: slug,
    slug,
    media: { thumbnail: null },
    location: {
      locality: "Demo locality",
      city: {
        id: 0,
        name: "Demo city",
        state: "Demo state",
      },
    },
  };
}

function normalize(value: string | null | undefined) {
  return (value ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function labelFromSlug(slug: string) {
  return slug.split("-").filter(Boolean).map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`).join(" ");
}

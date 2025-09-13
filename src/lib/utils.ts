import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function singularize(title: string) {
  // If the title ends with "s" (e.g., "Brands", "Customers")
  if (title.endsWith("s")) {
    return title.slice(0, -1);
  }
  return title; // leave it as is (e.g., "Product Catalog")
}

export function getPageTitle(
  pathname: string,
  navMain: { title: string; url: string }[]
) {
  const match = navMain.find((item) => pathname.startsWith(item.url));
  if (!match) return "Page";

  const relativePath = pathname
    .replace(match.url, "")
    .split("/")
    .filter(Boolean);

  if (relativePath.length === 0) {
    return match.title;
  }

  if (relativePath[0] === "create") {
    return `Add ${singularize(match.title)}`;
  }

  if (relativePath[0].match(/^[a-z0-9-]{10,}$/i)) {
    return `Update ${singularize(match.title)}`;
  }

  return match.title;
}

export function getStockStatus(
  quantity: number,
  minStock?: number | null
): string {
  if (quantity <= 0) return "OUT_OF_STOCK";
  if (minStock != null && quantity <= minStock) return "LOW_STOCK";
  return "IN_STOCK";
}

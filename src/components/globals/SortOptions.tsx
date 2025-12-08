"use client";

import React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconSortAscendingLetters } from "@tabler/icons-react";

const SortOptions = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get("sortBy") || "";

  const getSortLabel = () => {
    switch (currentSort) {
      case "name-asc":
        return "Ascending (A-Z)";
      case "name-desc":
        return "Descending (Z-A)";
      case "newest":
        return "Newest (First)";
      case "oldest":
        return "Oldest (First)";
      case "price-desc":
        return "Highest Price";
      case "price-asc":
        return "Lowest Price";
      default:
        return "Sort by";
    }
  };

  const handleSort = (sortValue: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (sortValue) {
      params.set("sortBy", sortValue);
    } else {
      params.delete("sortBy");
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="bg-primary lg:w-[500px] w-full px-3 py-1.5 flex items-center justify-between rounded-md text-white text-sm sm:text-base">
        <span>{getSortLabel()}</span>
        <IconSortAscendingLetters className="size-4 sm:size-5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[300px]">
        <DropdownMenuItem
          onClick={() => handleSort("name-asc")}
          className={currentSort === "name-asc" ? "bg-accent" : ""}
        >
          Ascending (A-Z)
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleSort("name-desc")}
          className={currentSort === "name-desc" ? "bg-accent" : ""}
        >
          Descending (Z-A)
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleSort("newest")}
          className={currentSort === "newest" ? "bg-accent" : ""}
        >
          Newest (First)
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleSort("oldest")}
          className={currentSort === "oldest" ? "bg-accent" : ""}
        >
          Oldest (First)
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleSort("price-desc")}
          className={currentSort === "price-desc" ? "bg-accent" : ""}
        >
          Highest Price
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleSort("price-asc")}
          className={currentSort === "price-asc" ? "bg-accent" : ""}
        >
          Lowest Price
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SortOptions;

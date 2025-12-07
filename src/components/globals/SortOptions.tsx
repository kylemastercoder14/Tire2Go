"use client";

import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconSortAscendingLetters } from "@tabler/icons-react";

const SortOptions = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="bg-primary lg:w-[500px] w-full px-3 py-1.5 flex items-center justify-between rounded-md text-white">
        <span>Sort by</span>
        <IconSortAscendingLetters className="size-5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[300px]">
        <DropdownMenuItem>Ascending (A-Z)</DropdownMenuItem>
        <DropdownMenuItem>Descending (Z-A)</DropdownMenuItem>
        <DropdownMenuItem>Newest (First)</DropdownMenuItem>
        <DropdownMenuItem>Oldest (First)</DropdownMenuItem>
        <DropdownMenuItem>Highest Price</DropdownMenuItem>
        <DropdownMenuItem>Lowest Price</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SortOptions;

"use client";

import { Policies } from "@prisma/client";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconEdit, IconTrash } from "@tabler/icons-react";

const PolicyCard = ({ data }: { data: Policies | null }) => {
  return (
    <Card className="rounded-sm">
      <CardContent>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg mb-2">{data?.type}</h3>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <IconEdit className="size-4" />
            </Button>
            <Button variant="destructive" size="icon">
              <IconTrash className="size-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PolicyCard;

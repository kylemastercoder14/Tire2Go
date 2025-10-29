import React from "react";
import db from "@/lib/db";
import Client from './_components/client';

const Page = async () => {
  const backUpHistory = await db.backupHistory.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
  return (
    <div>
      <Client data={backUpHistory} />
    </div>
  );
};

export default Page;

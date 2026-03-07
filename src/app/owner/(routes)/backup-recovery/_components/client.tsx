"use client";

import React, { useRef } from "react";
import { BackupHistory } from "@prisma/client";
import Heading from "@/components/globals/Heading";
import { Button } from "@/components/ui/button";
import { IconDatabase, IconRestore } from "@tabler/icons-react";
import { DataTable } from "@/components/globals/DataTable";
import { columns } from "./columns";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/globals/Modal";
import { Input } from "@/components/ui/input";

const Client = ({ data }: { data: BackupHistory[] }) => {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleBackup = async () => {
    const res = await fetch("/api/database/backup");
    const blob = await res.blob();

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "backup.json";
    a.click();
    window.URL.revokeObjectURL(url);
	router.refresh()
  };

  const handleRestore = async () => {
    const file = fileInput.current?.files?.[0];
    if (!file) return;

    const text = await file.text();
    const json = JSON.parse(text);

    setIsLoading(true);
    const res = await fetch("/api/database/restore", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(json),
    });

    await res.json();

    setIsLoading(false);
    setIsOpen(false);
    router.refresh();
  };
  return (
    <>
      <Modal
        title="Restore Database"
        description="Upload a JSON file to restore the database"
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      >
        <div className="flex items-center gap-2">
          <Input type="file" ref={fileInput} accept="application/json" />
          <Button onClick={handleRestore} disabled={isLoading} size="sm">
            Restore Database
          </Button>
        </div>
      </Modal>
      <div className="flex lg:flex-row flex-col lg:items-center gap-3 lg:justify-between">
        <Heading
          title="Database Backup & Restore"
          description="Backup and restore your data whenever you want"
        />
        <div className="flex items-center gap-3">
          <Button size="sm" onClick={handleBackup}>
            <IconDatabase className="size-4" />
            Download Backup
          </Button>
          <Button variant="secondary" onClick={() => setIsOpen(true)} size="sm">
            <IconRestore className="size-4" />
            Restore Backup
          </Button>
        </div>
      </div>

      <div className="mt-5">
        <DataTable
          columns={columns}
          data={data}
          searchPlaceholder="Filter by date created..."
        />
      </div>
    </>
  );
};

export default Client;

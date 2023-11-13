"use client";

import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { ApiList } from "@/components/ui/api-list";

import { BatchColumn, columns } from "./columns";

interface BatchesClientProps {
  data: BatchColumn[];
};

export const BatchesClient: React.FC<BatchesClientProps> = ({
  data
}) => {
  const params = useParams();
  const router = useRouter();

  return (
    <> 
      <div className="flex items-center justify-between">
        <Heading title={`Batches (${data.length})`} description="Manage stock for your store" />
        <Button onClick={() => router.push(`/${params.storeId}/batches/new`)}>
          <Plus className="mr-2 h-4 w-4" /> Add New
        </Button>
      </div>
      <Separator />
      <DataTable searchKey="name" columns={columns} data={data} />
      <Heading title="API" description="API Calls for Batches" />
      <Separator />
      <ApiList entityName="batches" entityIdName="batchId" />
    </>
  );
};

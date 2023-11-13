import { format } from "date-fns";

import prismadb from "@/lib/prismadb";
import { formatter } from "@/lib/utils";

import { BatchesClient } from "./components/client";
import { BatchColumn } from "./components/columns";

const BatchesPage = async ({
  params
}: {
  params: { storeId: string }
}) => {
  const batches = await prismadb.batch.findMany({
    where: {
      storeId: params.storeId
    },
    include: {
      category: true,
      size: true,
      color: true,
      product: true
    },
    orderBy: {
      createdAt: 'asc'
    }
  });
  
  const formattedBatches: BatchColumn[] = batches.map((batch) => ({
    id: batch.id,
    name: batch.product.name,
    supplierCost: batch.supplierCost,
    supplierName: batch.supplierName,
    quantity: batch.quantity,
    stock: batch.stock,
    category: batch.category.name,
    size: batch.size.name,
    color: batch.color.value,
    createdAt: format(batch.createdAt, 'MMMM do, yyyy'),
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <BatchesClient data={formattedBatches} />
      </div>
    </div>
  );
};

export default BatchesPage;

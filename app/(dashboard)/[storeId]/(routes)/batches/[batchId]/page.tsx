import { format } from "date-fns";

import prismadb from "@/lib/prismadb";
import { formatter } from "@/lib/utils";
import { BatchForm } from "./components/batch-form";
import { ProductColumn } from "./components/columns";
import { BatchEdit } from "./components/batch-edit";

const BatchPage = async ({
  params
}: {
  params: { batchId: string, storeId: string }
}) => {
    const products = await prismadb.product.findMany({
      where: {
        storeId: params.storeId
      },
      include: {
        category: true,
        size: true,
        color: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  
    const formattedProducts: ProductColumn[] = products.map((item) => ({
      id: item.id,
      name: item.name,
      isFeatured: item.isFeatured,
      isArchived: item.isArchived,
      price: formatter.format(item.price.toNumber()),
      category: item.category.name,
      size: item.size.name,
      color: item.color.value,
      createdAt: format(item.createdAt, 'MMMM do, yyyy'),
    }));
  
    // Batch
    const initialBatchData = await prismadb.batch.findUnique({
      where: {
        id: params.batchId,
      },
    });

  const categories = await prismadb.category.findMany({
    where: {
      storeId: params.storeId,
    },
  });

  const sizes = await prismadb.size.findMany({
    where: {
      storeId: params.storeId,
    },
  });

  const colors = await prismadb.color.findMany({
    where: {
      storeId: params.storeId,
    },
  });

  return ( 
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <BatchEdit
          categories={categories} 
          colors={colors}
          sizes={sizes}
          initialBatchData={initialBatchData}
          formattedProducts={formattedProducts}
        />
      </div>
    </div>
  );
}

export default BatchPage;

"use client";
import { RowSelection } from "@tanstack/react-table";

import { DataTable } from "@/components/ui/data-table";
import { ProductColumn, columns } from "./columns";
import { Batch, Product } from "@prisma/client";

interface ProductsSearchTableProps {
  data: ProductColumn[];
  onRowSelectionChange?: (selectedRows: typeof RowSelection) => void;
  initialBatchData: Batch;
};

export const ProductsSearchTable: React.FC<ProductsSearchTableProps> = ({
  data,
  onRowSelectionChange,
  initialBatchData
}) => {

  const initialProductId= initialBatchData?.productId
  
  return (
      <DataTable 
      searchKey={initialProductId? "id" : "name" }
      columns={columns} 
      data={data} 
      onRowSelectionChange={onRowSelectionChange}
      initialProductId={initialProductId}
      />
  );
};

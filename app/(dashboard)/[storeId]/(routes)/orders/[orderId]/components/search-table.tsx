"use client";

import { RowSelection } from "@tanstack/react-table";

import { DataTable } from "@/components/ui/data-table";
import { OrderItemColumn, columns } from "./columns";
import { Batch, Product } from "@prisma/client";

interface SearchTableProps {
  data: OrderItemColumn[];
  onRowSelectionChange?: (selectedRows: typeof RowSelection) => void;
  // initialBatchData: Batch;
};

export const SearchTable: React.FC<SearchTableProps> = ({
  data,
  onRowSelectionChange,
}) => {
  
  return (
      <DataTable 
      searchKey="id"
      columns={columns} 
      data={data} 
      onRowSelectionChange={onRowSelectionChange}
      // initialProductId={initialProductId}
      />
  );
};

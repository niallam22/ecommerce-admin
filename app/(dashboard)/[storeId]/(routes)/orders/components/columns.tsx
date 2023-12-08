"use client"

import { ColumnDef } from "@tanstack/react-table"

import { CellAction } from "./cell-action"
import { statuses } from "./data"
import { DataTableFacetedFilter } from "./data-table-faceted-filter"

export type OrderColumn = {
  id: string;
  phone: string;
  email: string;
  address: string;
  isPaid: boolean;
  totalPrice?: string;
  products: string;
  createdAt: string;
  status: string;
}

export const columns: ColumnDef<OrderColumn>[] = [
  {
    accessorKey: "id",
    header: "Order ID",
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "email",
    header: "email",
  },
  {
    accessorKey: "address",
    header: "Address",
  },
  {
    accessorKey: "totalPrice",
    header: "Total price",
  },
  {
    accessorKey: "isPaid",
    header: "Paid",
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableFacetedFilter options={statuses} column={column} title="Status" />
    )
    ,
    cell: ({ row }) => {
      const status = statuses.find(
        (status) => status.value === row.getValue("status")
      )

      if (!status) {
        return null
      }

      return (
        <div className="flex w-[100px] items-center">
          {status.icon && (
            <status.icon className="mr-2 h-4 w-4 text-muted-foreground" />
          )}
          <span>{status.label}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "createdAt",
    header: "Date",
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />
  },
];

"use client"

import { useEffect, useState } from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  Row,
  RowSelection,
  useReactTable,
  Header,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[],
  searchKey: string,
  onRowSelectionChange?: (selectedRows: typeof RowSelection) => void,
  // headerToggleSelectEnabled?: boolean //was used in product-search-table.tsx
  initialProductId?: string
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  onRowSelectionChange,
  // headerToggleSelectEnabled= false,
  initialProductId,
}: DataTableProps<TData, TValue>) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      columnFilters,
    },
    // enableRowSelection: true,
  });
  const rowSelectionState = table.getState().rowSelection

  const handleRowClick = (row: Row<TData>) => {

      row.toggleSelected();
      if (onRowSelectionChange) {
        onRowSelectionChange(table.getState().rowSelection);
      }
  };

  const handleHeaderClick = () => {
      // if (headerToggleSelectEnabled) {
        // If headerToggleSelectEnabled is true, update the state variable with selected rows
        if (onRowSelectionChange) {
          onRowSelectionChange(table.getState().rowSelection);
        }
      // }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    if (!initialProductId){
      //enable searching by searchKey
      table.getColumn(searchKey)?.setFilterValue(value);
    }
  };

  useEffect(()=>{
    if (initialProductId) {
      // If provided set the initialProductId as filter
      table.getColumn(searchKey)?.setFilterValue(initialProductId);
    }
  }
  ,[initialProductId]
  )

  useEffect(() => {
    // calls onRowSelectionChange when state updated ensures state synced with table
    if (onRowSelectionChange) {
      onRowSelectionChange(rowSelectionState);
    }
  }, [rowSelectionState, onRowSelectionChange]);

  return (
    <div>
      <div className="flex items-center py-4">
        <Input
          placeholder="Search"
          value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
          onChange={handleSearchChange}
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead 
                    key={header.id}
                    onClick={() => handleHeaderClick()}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => handleRowClick(row)}
                  // onChange={() => handleRowClick(row)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  )
}

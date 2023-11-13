"use client"

import { Category, Color, Batch, Size, Product } from "@prisma/client"
import { useEffect, useState } from "react";
import { RowSelection } from "@tanstack/react-table";
import axios from "axios"
import { toast } from "react-hot-toast"
import { useParams, useRouter } from "next/navigation";
import { Trash } from "lucide-react"

import { Separator } from "@/components/ui/separator"
import { Heading } from "@/components/ui/heading"
import { ProductColumn } from "./columns";
import { ProductsSearchTable } from "./product-search-table"
import { Subheading } from "@/components/ui/subheading"
import { BatchForm } from "./batch-form"
import { AlertModal } from "@/components/modals/alert-modal";
import { Button } from "@/components/ui/button"

interface BatchEditProps {
  initialBatchData: Batch;
  categories: Category[];
  colors: Color[];
  sizes: Size[];
  formattedProducts: ProductColumn[];
};

export const BatchEdit: React.FC<BatchEditProps> = ({
  initialBatchData,
  categories,
  sizes,
  colors,
  formattedProducts,
}) => {
    const params = useParams();
    const router = useRouter();

    const [selectedRowData, setSelectedRowData] = useState<ProductColumn[]>([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedRows, setSelectedRows] = useState<typeof RowSelection>({});

    const title = initialBatchData ? 'Edit batch' : 'Create batch';
    const description = initialBatchData ? `Edit batch: ${initialBatchData.id}` : 'Add a new batch';
    const subtitle = initialBatchData ? "Product details"  : "Select a product"
    const subDescription = initialBatchData ? "Product associated with this batch":'Use checkbox to select one product only'

    const handleRowSelectionChange = (newSelection: typeof RowSelection) => {
        setSelectedRows(newSelection);
    };

    useEffect(() => {
        const newData: ProductColumn[] = [];
        for (const row in selectedRows) {
          const selectedRowData = formattedProducts[Number(row)];
          newData.push(selectedRowData);
        }
        setSelectedRowData(newData);
      }, [selectedRows, formattedProducts]);
    
    const onDelete = async () => {
        try {
          setLoading(true);
          await axios.delete(`/api/${params.storeId}/products/${params.productId}`);
          router.refresh();
          router.push(`/${params.storeId}/products`);
          toast.success('Product deleted.');
        } catch (error: any) {
          toast.error('Something went wrong.');
        } finally {
          setLoading(false);
          setOpen(false);
        }
      }
    return (
            <>
                <AlertModal 
                    isOpen={open} 
                    onClose={() => setOpen(false)}
                    onConfirm={onDelete}
                    loading={loading}
                />
                <div className="flex items-center justify-between">
                    <Heading title={title} description={description} />
                    {initialBatchData && (
                    <Button
                        disabled={loading}
                        variant="destructive"
                        size="sm"
                        onClick={() => setOpen(true)}
                    >
                        <Trash className="h-4 w-4" />
                    </Button>
                    )}
                </div>
                <Separator />
                
                <Subheading title={subtitle} description={subDescription}/>
                <ProductsSearchTable 
                    data={formattedProducts} 
                    onRowSelectionChange={handleRowSelectionChange}
                    initialBatchData={initialBatchData}
                />

                <BatchForm
                    initialBatchData ={initialBatchData}
                    categories ={categories}
                    colors ={sizes}
                    sizes ={colors}
                    formattedProducts ={formattedProducts}
                    selectedRowData={selectedRowData}
                />
            </>
        );
    };

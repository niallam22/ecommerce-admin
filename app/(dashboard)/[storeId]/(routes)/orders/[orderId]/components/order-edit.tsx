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
import { OrderItemColumn } from "./columns";
import { SearchTable } from "./search-table"
import { Subheading } from "@/components/ui/subheading"
import { OrderForm } from "./order-form"
import { AlertModal } from "@/components/modals/alert-modal";
import { Button } from "@/components/ui/button"


export interface OrderInfo {
    id?: string;
    email?: string;
    phone?: string;
    address?: string;
  } 
interface OrderEditProps {
  orderId: string;
  formattedOrderItems: OrderItemColumn[];
  orderInfo: OrderInfo; 
};

export const OrderEdit: React.FC<OrderEditProps> = ({
  orderId,
  formattedOrderItems,
  orderInfo
}) => {
    const params = useParams();
    const router = useRouter();

    const [selectedRowData, setSelectedRowData] = useState<OrderItemColumn[]>([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedRows, setSelectedRows] = useState<typeof RowSelection>({});

    const title ='Edit order'
    const description = `Order ID: ${orderId}`
    const subtitle = "Order details" 
    const subDescription = formattedOrderItems.length > 1 ? 'Use checkbox to select and edit one order item only' : "Order item associated with this order"

    const handleRowSelectionChange = (newSelection: typeof RowSelection) => {
        setSelectedRows(newSelection);
    };

    useEffect(() => {
        const newData: OrderItemColumn[] = [];
        for (const row in selectedRows) {
          const selectedRowData = formattedOrderItems[Number(row)];
          newData.push(selectedRowData);
        }
        setSelectedRowData(newData);
      }, [selectedRows, formattedOrderItems]);
    
    const onDelete = async () => {
        // try {
        //   setLoading(true);
        //   await axios.delete(`/api/${params.storeId}/products/${params.productId}`);
        //   router.refresh();
        //   // router.push(`/${params.storeId}/products`);
        //   toast.success('Product deleted.');
        // } catch (error: any) {
        //   toast.error('Something went wrong.');
        // } finally {
        //   setLoading(false);
        //   setOpen(false);
        // }
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
                    <Button
                        disabled={true} //{loading}
                        variant="destructive"
                        size="sm"
                        onClick={() => setOpen(true)}
                    >
                        <Trash className="h-4 w-4" />
                    </Button>
                </div>
                <Separator />
                
                <Subheading title={subtitle} description={subDescription}/>
                <div className="flex flex-col">
                    <span>{`Email: ${orderInfo.email}`}</span>
                    <span>{`Phone: ${orderInfo.phone}`}</span>
                    <span>{`Address: ${orderInfo.address}`}</span>
                </div>
                <SearchTable 
                    data={formattedOrderItems} 
                    onRowSelectionChange={handleRowSelectionChange}
                    // initialBatchData={initialBatchData}
                />

                <OrderForm
                    formattedOrderItems={formattedOrderItems} 
                    selectedRowData={selectedRowData}
                />
            </>
        );
    };

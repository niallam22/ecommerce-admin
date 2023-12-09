"use client"

import * as z from "zod"
import axios from "axios"
import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "react-hot-toast"
import { Category, Color, Batch, Size, Product } from "@prisma/client"
import { useParams, useRouter } from "next/navigation"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { OrderItemColumn } from "./columns";
import { Subheading } from "@/components/ui/subheading"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const formSchema = z.object({
  supplierConfirmationId: z.string().min(1).optional(),
  status: z.string().min(1),
});

type OrderFormValues = z.infer<typeof formSchema>

interface OrderFormProps {
  formattedOrderItems: OrderItemColumn[];
  selectedRowData: OrderItemColumn[]
};

export const OrderForm: React.FC<OrderFormProps> = ({
  formattedOrderItems,
  selectedRowData
}) => {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const toastMessage ='Order updated.';
  const action = 'Save changes';
  const subtitle = "Order form"
  const subDescription = 'Submit order information for selected product'
  const orderItemId = selectedRowData[0]?.id

  useEffect(() => {
    const selectedRowSupplierConfirmationID = selectedRowData[0]?.supplierConfirmationId || ""
    const selectedRowStatus = selectedRowData[0]?.status || ""
    form.reset({
      supplierConfirmationId: selectedRowSupplierConfirmationID,
      status: selectedRowStatus
    });
  }, [selectedRowData]);

  const statuses = [
    {
      id:'1',
      value: 'pending'
    },
    {
      id:'2',
      value: 'ordered'
    },
    {
      id:'3',
      value: 'shipped'
    },
    {
      id:'4',
      value: 'return in progress'
    },
    {
      id:'5',
      value: 'return complete'
    },
  ]

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(formSchema),
  });
  
  const onSubmit = async (data: OrderFormValues) => {
    const submitData = {orderItemId: orderItemId, ...data}
    
    try {
      setLoading(true);
      if(selectedRowData.length !== 1){
        toast.error("Select 1 product (only).")
      }else{
        // if (initialBatchData) {
          await axios.patch(`/api/${params.storeId}/orders/${params.orderId}`, submitData);
        // } else {
        //   await axios.post(`/api/${params.storeId}/batches`, submitData);
        // }
        router.refresh();
        // router.push(`/${params.storeId}/orders`);
        toast.success(toastMessage);
      }
    } catch (error: any) {
      toast.error('Something went wrong.');
      console.log('Error: ', error)
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
     <div className="flex items-center justify-between">
        <Subheading title={subtitle} description={subDescription}/>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
          <div className="md:grid md:grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="supplierConfirmationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supplier confirmation ID</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="Supplier confirmation" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select disabled={loading} onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue defaultValue={field.value} placeholder="Select item status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {statuses.map((status,i) => (
                        <SelectItem key={status.id} value={status.value}>{status.value}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button disabled={loading} className="ml-auto" type="submit">
            {action}
          </Button>
        </form>
      </Form>
    </>
  );
};
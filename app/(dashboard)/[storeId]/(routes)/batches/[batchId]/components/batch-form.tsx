"use client"

import * as z from "zod"
import axios from "axios"
import { useState } from "react"
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
import { ProductColumn } from "./columns";
import { Subheading } from "@/components/ui/subheading"

const formSchema = z.object({
  supplierCost: z.coerce.number().min(0),//coerce required bc price is a decimal in schema
  quantity: z.coerce.number().min(0),
  supplierName: z.string().min(1),
  stock: z.coerce.number().min(0),
});

type BatchFormValues = z.infer<typeof formSchema>

interface BatchFormProps {
  initialBatchData: Batch;
  categories: Category[];
  colors: Color[];
  sizes: Size[];
  formattedProducts: ProductColumn[];
  selectedRowData: ProductColumn[]
};

export const BatchForm: React.FC<BatchFormProps> = ({
  initialBatchData,
  categories,
  sizes,
  colors,
  formattedProducts,
  selectedRowData
}) => {
  const params = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const toastMessage = initialBatchData ? 'Batch updated.' : 'Batch created.';
  const action = initialBatchData ? 'Save changes' : 'Create';
  const subtitle = "Batch details"
  const subDescription = 'Submit stock information for selected product'
  const productId = selectedRowData[0]?.id

  const defaultValues = initialBatchData ? {
    ...initialBatchData,
    supplierCost: parseFloat(String(initialBatchData?.supplierCost)),
  } : {
    productId: productId,
    supplierName: '',
    supplierCost: 0,
    quantity:0,
    stock: 0,
  }

  const form = useForm<BatchFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues
  });
  
  const onSubmit = async (data: BatchFormValues) => {
    const submitData = {productId: productId, ...data}
    
    try {
      setLoading(true);
      if(selectedRowData.length !== 1){
        toast.error("Select 1 product (only).")
      }else{
        if (initialBatchData) {
          await axios.patch(`/api/${params.storeId}/batches/${params.batchId}`, submitData);
        } else {
          await axios.post(`/api/${params.storeId}/batches`, submitData);
        }
        router.refresh();
        router.push(`/${params.storeId}/batches`);
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
              name="supplierName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supplier name</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="Supplier name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="supplierCost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cost</FormLabel>
                  <FormControl>
                    <Input type="number" disabled={loading} placeholder="Supplier cost (£)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity purchased</FormLabel>
                  <FormControl>
                    <Input type="number" disabled={loading} placeholder="Enter number of items" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="stock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock</FormLabel>
                  <FormControl>
                    <Input type="number" disabled={loading} placeholder="Enter number of current stock" {...field} />
                  </FormControl>
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
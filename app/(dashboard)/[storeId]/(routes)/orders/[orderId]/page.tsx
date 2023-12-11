import { format } from "date-fns";

import prismadb from "@/lib/prismadb";
import { formatter } from "@/lib/utils";
import { OrderItemColumn } from "./components/columns";
import { OrderEdit } from "./components/order-edit";

export interface OrderInfo {
  id?: string;
  email?: string;
  phone?: string;
  address?: string;
} 
 
const OrderPage = async ({
  params
}: {
  params: { orderId: string, storeId: string }
}) => {
  const orderItems = await prismadb.orderItem.findMany({
    where: {
      orderId: params.orderId,
    },
    include: {
      batches: true,
      product: {
        include: {
          category: true,
          size: true,
          color: true,
        },
      },
    },
  });


  const orderDetails = await prismadb.order.findUnique({
    where: {
      id: params.orderId,
    },
  });

  const orderInfo: OrderInfo = {
    id: orderDetails?.id,
    email: orderDetails?.email,
    phone: orderDetails?.phone,
    address: orderDetails?.address,
  }
  
  
    const formattedOrderItems: OrderItemColumn[] = orderItems.map((item) => ({
      id: item.id,
      batches: String(item?.batches.reduce((accum, batch)=>accum + batch.id +', ','').slice(0, -2)),
      quantity: String(item.quantity),
      name: item.product.name,
      price: formatter.format(item.productPrice.toNumber()),
      category: item.product.category.name,
      size: item.product.size.name,
      color: item.product.color.value,
      status: item.status,
      supplier: String(item?.batches.reduce((accum, batch)=>accum + batch.supplierName +', ','').slice(0, -2)),
      supplierConfirmationId: item.supplierConfirmationId,
    }));
  


  return ( 
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <OrderEdit
          orderId={params.orderId}
          formattedOrderItems={formattedOrderItems}
          orderInfo={orderInfo}
        />
      </div>
    </div>
  );
}

export default OrderPage;

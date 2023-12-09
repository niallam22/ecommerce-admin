import { format } from "date-fns";

import prismadb from "@/lib/prismadb";
import { OrderColumn } from "./components/columns"
import { OrderClient } from "./components/client";

const OrdersPage = async ({
  params
}: {
  params: { storeId: string }
}) => {
  const orders = await prismadb.order.findMany({
    where: {
      storeId: params.storeId
    },
    include: {
      orderItems: {
        include: {
          product: true,
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  const formattedOrders: OrderColumn[] = orders.map((item) => ({
    id: item.id,
    phone: item.phone,
    email: item.email,
    address: item.address,
    products: item.orderItems.map((orderItem) => orderItem.product.name).join(', '),
    totalPrice: String(item.totalPrice),
    isPaid: item.isPaid,
    createdAt: format(item.createdAt, 'MMMM do, yyyy'),
    status:   item.isPaid ===false ? 'pending payment' :
    item.orderItems.some((orderItem)=> orderItem.status === "ordered")? "ordered" :
    item.orderItems.every((orderItem)=> orderItem.status === "shipped")? "shipped" :
    item.orderItems.every((orderItem)=> orderItem.status === "return in progress") ? "full return in progress" :
    item.orderItems.some((orderItem)=> orderItem.status === "return in progress") ? "partial return in progress" :
    item.orderItems.every((orderItem)=> orderItem.status === "return complete") ? "full return complete" :
    item.orderItems.some((orderItem)=> orderItem.status === "return complete") ? "partial return complete" : '',
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <OrderClient data={formattedOrders} />
      </div>
    </div>
  );
};

export default OrdersPage;

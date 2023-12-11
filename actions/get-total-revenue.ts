import prismadb from "@/lib/prismadb";

export const getTotalRevenue = async (storeId: string) => {
  const paidOrders = await prismadb.order.findMany({
    where: {
      storeId,
      isPaid: true
    },
    include: {
      orderItems: true
    }
  });

  const totalRevenue = paidOrders.reduce((total, order) => {
    const orderTotal = order.orderItems.reduce((orderSum, item) => {
      if(item.status === "shipped" || "ordered"){
        return orderSum + item.productPrice.toNumber()* item.quantity;
      }else{
        return orderSum
      }
    }, 0);
    return total + orderTotal;
  }, 0);

  return totalRevenue;
};

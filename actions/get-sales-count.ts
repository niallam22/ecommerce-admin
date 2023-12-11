import prismadb from "@/lib/prismadb";

export const getSalesCount = async (storeId: string) => {
  
    const paidOrders = await prismadb.order.findMany({
      where: {
        storeId,
        isPaid: true
      },
      include: {
        orderItems: true
      }
    });
  
    const totalSales = paidOrders.reduce((total, order) => {
      const orderTotalSales = order.orderItems.reduce((orderSales, item) => {
        if(item.status === "shipped" || "ordered"){
          return orderSales + item.quantity;
        }else{
          return orderSales
        }
      }, 0);
      return total + orderTotalSales;
    }, 0);

  return totalSales;
};

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";

export async function PATCH(
  req: Request,
  { params }: { params: { orderId: string, storeId: string } }
) {
  try {
    const { userId } = auth();

    const body = await req.json();

    const { orderItemId, status, supplierConfirmationId } = body;

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!orderItemId) {
      return new NextResponse("Order item id is required", { status: 400 });
    }

    if (!status) {
      return new NextResponse("Status is required", { status: 400 });
    }

    // if (!supplierConfirmationId) {
    //   return new NextResponse("Supplier confirmation id is required", { status: 400 });
    // }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId
      }
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 405 });
    }

    const color = await prismadb.orderItem.update({
      where: {
        id: orderItemId
      },
      data: {
        status,
        supplierConfirmationId
      }
    });
  
    return NextResponse.json(color);
  } catch (error) {
    console.log('[ORDER_ITEM_PATCH]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};

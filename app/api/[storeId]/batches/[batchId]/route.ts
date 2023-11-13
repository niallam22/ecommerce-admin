import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";

export async function GET(
  req: Request,
  { params }: { params: { batchId: string, storeId: string } }
) {
  try {
    if (!params.batchId) {
      return new NextResponse("Batch id is required", { status: 400 });
    }

    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    const batch = await prismadb.batch.findUnique({
      where: {
        id: params.batchId
      }
    });
  
    return NextResponse.json(batch);
  } catch (error) {
    console.log('[BATCH_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};

export async function DELETE(
  req: Request,
  { params }: { params: { batchId: string, storeId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!params.batchId) {
      return new NextResponse("Batch id is required", { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId
      }
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 405 });
    }

    const batch = await prismadb.batch.delete({
      where: {
        id: params.batchId
      },
    });
  
    return NextResponse.json(batch);
  } catch (error) {
    console.log('[BATCH_DELETE]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};


export async function PATCH(
  req: Request,
  { params }: { params: { batchId: string, storeId: string } }
) {

  try {
    const { userId } = auth();

    const body = await req.json();

    const { productId, supplierCost, quantity, stock, supplierName } = body;

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!productId) {
      return new NextResponse("ProductId is required", { status: 400 });
    }

    if (supplierCost === undefined || supplierCost === null || supplierCost < 0) {
      return new NextResponse("Supplier cost must be greater than or equal to 0", { status: 400 });
    }
    
    if (quantity === undefined || quantity === null || quantity < 0) {
      return new NextResponse("Purchase quantity must be greater than or equal to 0", { status: 400 });
    }
    
    if (stock === undefined || stock === null || stock < 0) {
      return new NextResponse("Remaining stock must be greater than or equal to 0", { status: 400 });
    }

    if (!supplierName) {
      return new NextResponse("Supplier name is required", { status: 400 });
    }
    
    if (stock > quantity) {
      return new NextResponse("Stock value must be less than or equal to purchase quantity", { status: 400 });
    }

    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    if(typeof supplierName === 'string'){
      supplierName.toLowerCase()
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId
      }
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 405 });
    }

    const batch = await prismadb.batch.update({
      where: {
        id: params.batchId
      },
      data: {
        // productId,
        // storeId: params.storeId,
        supplierCost, 
        quantity, 
        stock, 
        supplierName,
      },
    })
  
    return NextResponse.json(batch);
  } catch (error) {
    console.log('[BATCH_PATCH]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};

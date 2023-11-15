import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';

import prismadb from '@/lib/prismadb';

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
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

    const batch = await prismadb.batch.create({
      data: {
        productId, 
        supplierCost, 
        quantity, 
        stock, 
        supplierName,
        storeId: params.storeId,
      },
    });
  
    return NextResponse.json(batch);
  } catch (error) {
    console.log('[BATCHES_POST]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};

// GET batches api not required by front-end
// export async function GET(
//   req: Request,
//   { params }: { params: { storeId: string } },
// ) {
//   try {
//     const { searchParams } = new URL(req.url)
//     if (!params.storeId) {
//       return new NextResponse("Store id is required", { status: 400 });
//     }

//     // const batches = await prismadb.batch.findMany({
//     //   where: {
//     //     storeId: params.storeId,
//     //   },
//     //   orderBy: {
//     //     createdAt: 'desc',
//     //   }
//     // });
  
//     return NextResponse.json(' batches/route.ts get batches end point hit');
//   } catch (error) {
//     console.log('[BATCHES_GET]', error);
//     return new NextResponse("Internal error", { status: 500 });
//   }
// };

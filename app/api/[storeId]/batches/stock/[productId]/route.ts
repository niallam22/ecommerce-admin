import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';

import prismadb from '@/lib/prismadb';

// GET batches api not required by front-end
// export async function GET(
//   req: Request,
//   { params }: { params: { storeId: string, productId: string } },
// ) {
//   try {

//     if (!params.storeId) {
//       return new NextResponse("Store id is required", { status: 400 });
//     }

//     if (!params.productId) {
//         return new NextResponse("ProductId is required", { status: 400 });
//       }

//     const batches = await prismadb.batch.findMany({
//       where: {
//         storeId: params.storeId,
//         productId: params.productId,
//       },
//       orderBy: {
//         createdAt: 'desc',
//       }
//     });

//     console.log(batches);
    
  
//     return NextResponse.json(batches);
//   } catch (error) {
//     console.log('[BATCHES_GET]', error);
//     return new NextResponse("Internal error", { status: 500 });
//   }
// };


export async function GET(
  req: Request,
  { params }: { params: { storeId: string, productId: string } },
) {
  try {
    // const { searchParams } = new URL(req.url)
    
    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    if (!params.productId) {
      return new NextResponse("Product id is required", { status: 400 });
    }

    const batches = await prismadb.batch.findMany({
      where: {
        storeId: params.storeId,
        productId: params.productId
      },
      orderBy: {
        createdAt: 'desc',
      }
    });

    const stock = batches.reduce((accum, batch)=>accum + batch.stock,0)
  
    return NextResponse.json({productId:params.productId, stock: stock});
  } catch (error) {
    console.log('[BATCHES_STOCK_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};
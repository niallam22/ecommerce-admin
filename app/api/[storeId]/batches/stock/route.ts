import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';

import prismadb from '@/lib/prismadb';

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } },
) {
  try {
    const { searchParams } = new URL(req.url)
    const productIds = searchParams.get('productIds') || undefined;
    const productIdArr = productIds?.split(',').map(id => id.trim());
    
    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    if (!productIds) {
      return new NextResponse("Product id is required", { status: 400 });
    }

    if(productIdArr && productIdArr.length !== 0){
      const result = await Promise.all(
        productIdArr.map(async productId => {
          const batches = await prismadb.batch.findMany({
            where: {
              storeId: params.storeId,
              productId: productId,
            },
            orderBy: {
              createdAt: 'desc',
            },
          });
          const stock = batches.reduce((accum, batch) => accum + batch.stock, 0);
          return { productId, stock };
        })
      );
      return NextResponse.json(result);
    }else {
      return new NextResponse("Product id is required", { status: 400 });
    }
  
  } catch (error) {
    console.log('[BATCHES_STOCK_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};
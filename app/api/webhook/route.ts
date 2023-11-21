import Stripe from "stripe"
import { headers } from "next/headers"
import { NextResponse } from "next/server"

import { stripe } from "@/lib/stripe"
import prismadb from "@/lib/prismadb"

export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get("Stripe-Signature") as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 })
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const address = session.shipping_details?.address
  
  const addressComponents = [
    address?.line1,
    address?.line2,
    address?.city,
    address?.state,
    address?.postal_code,
    address?.country
  ];

  const addressString = addressComponents.filter((c) => c !== null).join(', ');
  console.log('webhook triggered. Event.type: ', event.type)
  if (event.type === "checkout.session.completed") {
    const order = await prismadb.order.update({
      where: {
        id: session?.metadata?.orderId,
      },
      data: {
        isPaid: true,
        address: addressString,
        phone: session?.customer_details?.phone || '',
        email: session?.customer_details?.email || '',
      },
      include: {
        orderItems: true,
      }
    });

    const orderItems = await prismadb.orderItem.findMany({
      where: {
        orderId: session?.metadata?.orderId,
      }
    });

    //if successful remove stock from batch and create (many-to-many) connection between batch and orderItem
    for (const item of orderItems) {
      const productId = item.productId;
      const productQuantity = item.quantity;
      let remainingQuantity = productQuantity;
  
      // Find all batches associated with the product, ordered by creation date ascending
      const batches = await prismadb.batch.findMany({
        where: {
          productId: productId,
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      //potentially multiple batches for each product hence nested loops
      for (const batch of batches) {
        const batchId = batch.id;
        const batchStock = batch.stock;
  
        // Calculate how much stock to subtract from this batch (ie if batchStock is smaller then you can only subtract the batchStock that is remaining)
        const stockToSubtract = Math.min(remainingQuantity, batchStock);
  
        // Update batch stock
        await prismadb.batch.update({
          where: { id: batchId },
          data: { stock: batchStock - stockToSubtract },
        });

        //OrderItem associated with product in current product loop
        const orderItem = await prismadb.orderItem.findFirst({
          where: {
            productId: productId,
            orderId: order.id
          }
        });
  
        if (orderItem) {
          // Update OrderItem with the batchId from current batch loop
          const updatedOrderItem = await prismadb.orderItem.update({
            where: {
              id: orderItem.id,
            },
            data: {
              batches: {
                connect: [{ id: batchId }],
              },
            },
          });
      
          // Check if the update was successful
          if (updatedOrderItem) {
            console.log(`Updated OrderItem ${updatedOrderItem.id} with BatchId ${batchId}`);
          } else {
            console.error('Failed to update OrderItem with BatchId');
          }
        } else {
          console.error(`OrderItem not found for ProductId: ${productId} and BatchId: ${batchId}`);
        }
        
        // Update remaining quantity
        remainingQuantity -= stockToSubtract;
  
        // If remaining quantity is zero, break out of the loop
        if (remainingQuantity === 0) {
          break;
        }
      }
    }
}

  return new NextResponse(null, { status: 200 });
};

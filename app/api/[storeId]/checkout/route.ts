import Stripe from "stripe";
import { NextResponse } from "next/server";

import { stripe } from "@/lib/stripe";
import prismadb from "@/lib/prismadb";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", //add specific domains and/or change the frontEnd api request to a server action instead of a client side request so that cors is not an issue
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(
  req: Request,//Request type is a HTTP req object provided by next
  { params }: { params: { storeId: string } }
) {
  interface Item {
    productId: string; 
    quantity: number;
  }
  const { items } = await req.json();
  const shippingPrice = 3.25
  const vat = 0.2
  
  const hasErrorQuantities = items.some((item: Item )=> item.quantity === 0 || typeof item.quantity !== 'number' || item.quantity < 0)

  if (!items || items.length === 0 || hasErrorQuantities ) {
    return new NextResponse("Products are required", { status: 400 });
  }
  
  const productIds = items.map((item:Item) => item.productId)

  const products = await prismadb.product.findMany({
    where: {
      id: {
        in: productIds
      }
    }
  });
  
  //Add quantity data to product
  const productsWithQuantity = products.map((product) => {
    const item = items.find((item: Item) => item.productId === product.id);
    const quantity = Math.abs(item.quantity);
    return {
      ...product,
      quantity: quantity
    };
  });

  //Add stock data to product
  const productsQuantityStock = await Promise.all(
    productsWithQuantity.map(async product => {
      const batches = await prismadb.batch.findMany({
        where: {
          storeId: params.storeId, 
          productId: product.id,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      const stock = batches.reduce((accum, batch) => accum + batch.stock, 0);
      return { ...product, stock };
    })
  );

  const hasStock = productsQuantityStock.every((product)=> product.quantity <= product.stock )
  if (!hasStock ) {
    return new NextResponse("Product quantity exceeds available stock", { status: 400 });
  }

  const subTotal = productsWithQuantity.reduce((accum, product) => accum + product.price.toNumber() * product.quantity, 0) + shippingPrice
  const vatTotal = vat * subTotal
  const totalPrice = vatTotal + subTotal + shippingPrice
  
  const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

  productsWithQuantity.forEach((product) => {
    line_items.push({
      quantity: product.quantity,
      price_data: {
        currency: 'GBP',
        product_data: {
          name: product.name,
        },
        unit_amount: Math.round(product.price.toNumber() * 100)
      }
    });
  });

  line_items.push({
    quantity: 1,
    price_data: {
      currency: 'GBP',
      product_data: {
        name: "shipping",
      },
      unit_amount: Math.round(shippingPrice * 100)
    }
  });

  line_items.push({
    quantity: 1,
    price_data: {
      currency: 'GBP',
      product_data: {
        name: "VAT",
      },
      unit_amount: Math.round(vatTotal * 100)
    }
  });

  const order = await prismadb.order.create({
    data: {
      storeId: params.storeId,
      isPaid: false,
      totalPrice: totalPrice,
      subtotalPrice: subTotal,
      shippingPrice: shippingPrice,
      vatTotal: vatTotal,
      orderItems: {
        create: productsWithQuantity.map((product) => ({
          product: {
            connect: {
              id: product.id
            }
          },
          quantity: product.quantity,
          productPrice: product.price
        }))
      }
    }
  });
  
  const session = await stripe.checkout.sessions.create({
    line_items,
    mode: 'payment',
    billing_address_collection: 'required',
    phone_number_collection: {
      enabled: true,
    },
    success_url: `${process.env.FRONT_END_STORE_URL}/cart?success=1`,
    cancel_url: `${process.env.FRONT_END_STORE_URL}/cart?canceled=1`,
    metadata: {
      orderId: order.id,     
    },
  });

  return NextResponse.json({ url: session.url },
    {
    headers: corsHeaders
  }
  );
};

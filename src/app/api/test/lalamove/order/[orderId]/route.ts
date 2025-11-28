import { NextRequest, NextResponse } from "next/server";
import { getOrderDetails, cancelOrder } from "@/test/lalamove-delivery/lib/lalamove";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;

    if (!orderId) {
      return NextResponse.json(
        { error: "orderId is required" },
        { status: 400 }
      );
    }

    const result = await getOrderDetails(orderId);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error getting order details:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to get order details",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;

    if (!orderId) {
      return NextResponse.json(
        { error: "orderId is required" },
        { status: 400 }
      );
    }

    const result = await cancelOrder(orderId);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error canceling order:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to cancel order",
      },
      { status: 500 }
    );
  }
}


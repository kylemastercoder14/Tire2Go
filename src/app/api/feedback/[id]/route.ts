import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { checkAdminPermission } from "@/lib/admin-auth";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const permission = await checkAdminPermission("feedback", "delete");
    if (!permission.allowed) {
      return NextResponse.json(
        { error: permission.error },
        { status: permission.status }
      );
    }

    const { id } = await params;

    // Check if feedback exists
    const feedback = await db.feedback.findUnique({
      where: { id },
    });

    if (!feedback) {
      return NextResponse.json(
        { error: "Feedback not found" },
        { status: 404 }
      );
    }

    // Delete feedback
    await db.feedback.delete({
      where: { id },
    });

    return NextResponse.json({
      success: "Feedback deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting feedback:", error);
    return NextResponse.json(
      { error: "Failed to delete feedback" },
      { status: 500 }
    );
  }
}


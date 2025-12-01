import { NextRequest, NextResponse } from "next/server";
import AWS from "aws-sdk";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const fileUrl = searchParams.get("url");

    if (!fileUrl) {
      return NextResponse.json(
        { error: "File URL is required" },
        { status: 400 }
      );
    }

    // Configure AWS SDK
    AWS.config.update({
      accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY,
    });

    const s3 = new AWS.S3({
      region: "ap-southeast-2",
    });

    // Extract the key from the full URL
    const bucketUrl = `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.ap-southeast-2.amazonaws.com/`;
    if (!fileUrl.startsWith(bucketUrl)) {
      return NextResponse.json(
        { error: "Invalid S3 URL" },
        { status: 400 }
      );
    }

    const key = fileUrl.replace(bucketUrl, "");

    // Generate signed URL (valid for 1 hour)
    const signedUrl = s3.getSignedUrl("getObject", {
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
      Key: key,
      Expires: 3600, // 1 hour
    });

    return NextResponse.json({ signedUrl });
  } catch (error) {
    console.error("Error generating signed URL:", error);
    return NextResponse.json(
      { error: "Failed to generate signed URL" },
      { status: 500 }
    );
  }
}

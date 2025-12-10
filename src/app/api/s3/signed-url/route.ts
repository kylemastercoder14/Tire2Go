import { NextRequest, NextResponse } from "next/server";
import AWS from "aws-sdk";

export const runtime = "nodejs";

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
    let key: string;

    if (fileUrl.startsWith(bucketUrl)) {
      key = fileUrl.replace(bucketUrl, "");
    } else if (fileUrl.includes('/ecr/')) {
      // Extract key from path like /ecr/filename.glb
      key = fileUrl.includes('s3.amazonaws.com')
        ? fileUrl.split('.s3.amazonaws.com/')[1]
        : fileUrl.startsWith('/')
          ? fileUrl.substring(1)
          : fileUrl;
    } else {
      return NextResponse.json(
        { error: "Invalid S3 URL" },
        { status: 400 }
      );
    }

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

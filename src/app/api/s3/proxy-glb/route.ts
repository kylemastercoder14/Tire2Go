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

    // Fetch the file from S3
    const s3Object = await s3.getObject({
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
      Key: key,
    }).promise();

    // Return the file with proper headers to bypass CORS
    // Convert S3 Body to Buffer, then to ArrayBuffer for NextResponse
    let buffer: Buffer;
    if (Buffer.isBuffer(s3Object.Body)) {
      buffer = s3Object.Body;
    } else if (s3Object.Body instanceof Uint8Array) {
      buffer = Buffer.from(s3Object.Body);
    } else if (typeof s3Object.Body === 'string') {
      buffer = Buffer.from(s3Object.Body, 'binary');
    } else {
      // Fallback: convert to Buffer
      buffer = Buffer.from(s3Object.Body as any);
    }

    // Create a new ArrayBuffer from the Buffer to avoid SharedArrayBuffer issues
    const arrayBuffer = new ArrayBuffer(buffer.length);
    const uint8Array = new Uint8Array(arrayBuffer);
    uint8Array.set(buffer);

    return new NextResponse(arrayBuffer, {
      headers: {
        "Content-Type": "model/gltf-binary",
        "Content-Disposition": `inline; filename="${key.split('/').pop()}"`,
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
        "Access-Control-Allow-Origin": "*", // Allow CORS
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error: any) {
    console.error("Error proxying GLB file:", error);
    return NextResponse.json(
      { error: "Failed to proxy GLB file", details: error?.message },
      { status: 500 }
    );
  }
}


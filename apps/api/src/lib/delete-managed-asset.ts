import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";

function managedUploadKey(value: string): string | null {
  if (!value.startsWith("/uploads/")) return null;
  return value.replace(/^\/+/, "");
}

export async function deleteManagedAsset(value: string) {
  const key = managedUploadKey(value);
  if (!key || process.env.STORAGE_PROVIDER !== "s3") return;

  const region = process.env.AWS_REGION;
  const bucket = process.env.AWS_S3_BUCKET;
  if (!region || !bucket) {
    console.warn("[asset-cleanup] S3 cleanup skipped: AWS_REGION or AWS_S3_BUCKET is missing.");
    return;
  }

  try {
    const s3 = new S3Client({ region });
    await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
  } catch (error) {
    console.warn("[asset-cleanup] failed to delete S3 object", { bucket, key, error });
  }
}

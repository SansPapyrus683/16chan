import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { env } from "@/env.js";
import { removeDataURL } from "@/lib/files";

export const s3 = new S3Client({});

export async function s3Upload(name: string, data: string, content: string) {
  return await s3.send(
    new PutObjectCommand({
      Bucket: env.AWS_S3_BUCKET_NAME,
      Key: name,
      ContentType: content,
      Body: Buffer.from(removeDataURL(data), "base64"),
    }),
  );
}

export async function s3Retrieve(name: string) {
  const cmd = new GetObjectCommand({
    Bucket: env.AWS_S3_BUCKET_NAME,
    Key: name,
  });
  return getSignedUrl(s3, cmd, { expiresIn: 3600 });
}

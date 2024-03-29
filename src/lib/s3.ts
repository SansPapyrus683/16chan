import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { env } from "@/env.js";
import { base64StripUrl } from "@/lib/files";

const s3 = new S3Client({});

export function s3Upload(name: string, data: string, content: string) {
  return s3.send(
    new PutObjectCommand({
      Bucket: env.AWS_BUCKET_RAW,
      Key: name,
      ContentType: content,
      Body: Buffer.from(base64StripUrl(data), "base64"),
    }),
  );
}

/*
 * these two functions (s3Get & s3RawUrl) aren't needed since the cdn thing
 * i'll keep them here just in case we need them
 */
export function s3Get(name: string, mini: boolean = true) {
  const cmd = new GetObjectCommand({
    Bucket: mini ? env.AWS_BUCKET_MINI : env.AWS_BUCKET_RAW,
    Key: name,
  });
  return getSignedUrl(s3, cmd, { expiresIn: 3600 });
}

export function s3RawUrl(name: string, mini: boolean = true) {
  const bucket = mini ? env.AWS_BUCKET_MINI : env.AWS_BUCKET_RAW;
  return `https://${bucket}.s3.${env.AWS_REGION}.amazonaws.com/${name}`;
}

export function s3Delete(name: string) {
  const buckets = [env.AWS_BUCKET_MINI, env.AWS_BUCKET_RAW];
  return Promise.all(
    buckets.map(
      async (b) =>
        await s3.send(
          new DeleteObjectCommand({
            Bucket: b,
            Key: name,
          }),
        ),
    ),
  );
}

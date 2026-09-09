/**
 * S3-kompatibel objektlagring för TILLFÄLLIGA filer:
 * - Signaturbilder (raderas så snart signed PDF är genererad)
 * - Signed PDF:er (raderas så snart leverans till HR-system är bekräftad)
 * - QR-kods PNG (cachad, kan återgenereras)
 *
 * Fungerar med Supabase Storage, Cloudflare R2, AWS S3.
 */

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export const s3 = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION ?? 'eu-north-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true,
});

const BUCKET = process.env.S3_BUCKET!;

export async function uploadObject(opts: {
  key: string;
  body: Buffer;
  contentType: string;
}) {
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: opts.key,
      Body: opts.body,
      ContentType: opts.contentType,
      // Krypteras automatiskt av lagringsleverantören (AES-256)
    })
  );
  return opts.key;
}

export async function getObject(key: string): Promise<Buffer> {
  const res = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
  const chunks: Uint8Array[] = [];
  for await (const chunk of res.Body as AsyncIterable<Uint8Array>) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

export async function deleteObject(key: string) {
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

/**
 * Skapa en tidsbegränsad signerad URL.
 * Bara internt bruk — kunden ser aldrig dessa URL:er.
 */
export async function getSignedDownloadUrl(key: string, ttlSeconds: number = 900) {
  return getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: BUCKET, Key: key }),
    { expiresIn: ttlSeconds }
  );
}

import { randomBytes } from "node:crypto";
import { SITE_URL } from "@/lib/brand";
import { ensureSchema, sql } from "./db";

const LIMIT = 4_000_000;
const TYPES: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg", "image/gif": "gif", "image/webp": "webp" };

export async function storePicture(body: ArrayBuffer, type: string) {
  const ext = TYPES[type];
  if (!ext) throw new Error("Choose a PNG, JPEG, GIF or WebP.");
  if (body.byteLength > LIMIT) throw new Error("This picture is too big. Keep it under 4 MB.");
  // Stored in Postgres and served by /api/picture/<id>: no extra storage service to run out of.
  const id = `pic_${randomBytes(9).toString("base64url")}`;
  const url = `${SITE_URL}/api/picture/${id}.${ext}`;
  await ensureSchema();
  await sql`insert into ja_pictures (id, url, type, data) values (${id}, ${url}, ${type}, ${Buffer.from(body)})`;
  return { id, url };
}

export async function pictureUrl(id: string): Promise<string | null> {
  await ensureSchema();
  const [row] = await sql<{ url: string }[]>`select url from ja_pictures where id = ${id}`;
  return row?.url ?? null;
}

export async function pictureData(id: string) {
  await ensureSchema();
  const [row] = await sql<{ type: string; data: Buffer }[]>`select type, data from ja_pictures where id = ${id}`;
  return row ?? null;
}

/** A launch under review: the card's picture lands here server-side, so launch_coin finds it from review_id alone. */
export async function createReview(args: Record<string, unknown>, image: string | null) {
  await ensureSchema();
  const id = `rev_${randomBytes(6).toString("base64url")}`;
  await sql`insert into ja_reviews (id, args, image) values (${id}, ${sql.json(args as never)}, ${image})`;
  return id;
}

export async function setReviewImage(id: string, url: string) {
  await ensureSchema();
  await sql`update ja_reviews set image = ${url} where id = ${id} and token is null`;
}

export async function getReview(id: string) {
  await ensureSchema();
  const [r] = await sql<{ args: Record<string, unknown>; image: string | null; token: string | null }[]>`
    select args, image, token from ja_reviews where id = ${id} and created_at > now() - interval '1 day'`;
  return r ?? null;
}

export async function markReviewLaunched(id: string, token: string) {
  await sql`update ja_reviews set token = ${token} where id = ${id}`;
}

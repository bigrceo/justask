import { setReviewImage, storePicture } from "@/server/pictures";

// The picture panel runs inside Claude / ChatGPT's sandboxed iframe, so this is called cross-origin.
const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST, OPTIONS",
  "access-control-allow-headers": "content-type",
};

export const OPTIONS = () => new Response(null, { status: 204, headers: CORS });

export async function POST(req: Request) {
  try {
    const type = (req.headers.get("content-type") ?? "").split(";")[0];
    const p = await storePicture(await req.arrayBuffer(), type);
    const review = new URL(req.url).searchParams.get("review");
    if (review) await setReviewImage(review, p.url);
    return Response.json({ ok: true, stored: true, id: p.id, url: p.url }, { headers: CORS });
  } catch (e) {
    return Response.json({ ok: false, error: (e as Error).message }, { status: 400, headers: CORS });
  }
}

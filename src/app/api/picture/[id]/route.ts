import { pictureData } from "@/server/pictures";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pic = await pictureData(id.replace(/\.[a-z]+$/, ""));
  if (!pic) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(pic.data), {
    headers: { "content-type": pic.type, "cache-control": "public, max-age=31536000, immutable", "access-control-allow-origin": "*" },
  });
}

// Syntax-checks the inline scripts of the in-chat cards: a broken card renders as nothing in Claude / ChatGPT.
import { coinCardHtml, listCardHtml } from "../src/server/coinCard.ts";
import { picturePanelHtml } from "../src/server/picturePanel.ts";
for (const [name, html] of [["coin", coinCardHtml("https://x.y")], ["list", listCardHtml("https://x.y")], ["panel", picturePanelHtml("https://x.y")]] as const) {
  const js = html.split("<script>")[1].split("</script>")[0];
  try { new Function(js); } catch (e) { console.error(`${name} card script is broken: ${(e as Error).message}`); process.exit(1); }
}
console.log("cards ok");

// Draws the FORMS hotspot boxes from guide_Ver1.1.html onto the form images for visual checking.
// usage: node overlay.mjs <guide.html> <formsDir> <outDir>
import fs from "node:fs";
import path from "node:path";
import { createCanvas, loadImage } from "@napi-rs/canvas";
const [html, formsDir, outDir] = process.argv.slice(2);
const src = fs.readFileSync(html, "utf8");
const m = src.match(/const NTA_FORM=[^\n]*\nconst FORMS=([\s\S]*?);\nconst WHO=/);
if (!m) throw new Error("FORMS not found");
const FORMS = new Function("NTA_FORM", "return " + m[1])("");
fs.mkdirSync(outDir, { recursive: true });
for (const [key, f] of Object.entries(FORMS)) {
  const img = await loadImage(fs.readFileSync(path.join(formsDir, path.basename(f.img))));
  const c = createCanvas(img.width, img.height), ctx = c.getContext("2d");
  ctx.drawImage(img, 0, 0);
  for (const s of f.spots) {
    const [l, t, w, h] = s.box.map((v, i) => v / 100 * (i % 2 ? img.height : img.width));
    ctx.lineWidth = 4; ctx.strokeStyle = s.co ? "rgba(80,90,100,.9)" : "rgba(200,70,44,.9)";
    ctx.fillStyle = s.co ? "rgba(80,90,100,.10)" : "rgba(200,70,44,.12)";
    ctx.fillRect(l, t, w, h); ctx.strokeRect(l, t, w, h);
    ctx.fillStyle = s.co ? "#54616C" : "#C8462C"; ctx.beginPath(); ctx.arc(l, t, 22, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.font = "bold 24px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(s.n, l, t + 1);
  }
  const out = path.join(outDir, key + "-overlay.png");
  fs.writeFileSync(out, await c.encode("png"));
  console.log(out, img.width + "x" + img.height, f.spots.length, "spots");
}

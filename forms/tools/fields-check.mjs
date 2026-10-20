// Draws the hoken.html field boxes (const F) onto the 保険料控除申告書 image for position checking.
// usage: node fields-check.mjs <hoken.html> <f3.png> <out.png>
import fs from "node:fs";
import { createCanvas, loadImage } from "@napi-rs/canvas";
const [html, imgPath, out] = process.argv.slice(2);
const src = fs.readFileSync(html, "utf8");
const m = src.match(/const F=(\{[\s\S]*?\});\nconst REGION=(\{[\s\S]*?\});\n/);
if (!m) throw new Error("F/REGION not found");
const F = new Function("return " + m[1])(), REGION = new Function("IW,IH", "return " + m[2])(1853, 1310);
const img = await loadImage(fs.readFileSync(imgPath));
const c = createCanvas(img.width, img.height), ctx = c.getContext("2d");
ctx.drawImage(img, 0, 0);
const box = (x, y, w, h, label, color = "rgba(31,74,168,.9)") => {
  ctx.lineWidth = 3; ctx.strokeStyle = color; ctx.fillStyle = color.replace(".9", ".12"); ctx.fillRect(x, y, w, h); ctx.strokeRect(x, y, w, h);
  ctx.fillStyle = color; ctx.font = "bold 20px sans-serif"; ctx.textBaseline = "top"; ctx.fillText(label, x + 3, y + 2);
};
const circ = (cx, cy, r, label) => { ctx.lineWidth = 3; ctx.strokeStyle = "rgba(200,70,44,.9)"; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke(); ctx.fillStyle = "rgba(200,70,44,.9)"; ctx.font = "bold 16px sans-serif"; ctx.fillText(label, cx + r + 2, cy - 8); };
for (const [k, v] of Object.entries(F)) {
  if (/Rows$/.test(k)) { const col = k === "eqRows" ? F.eqCol : k === "socRows" ? F.socCol : F.aCol; v.forEach(([y0, y1], i) => box(col[0], y0, col[1] - col[0], y1 - y0, `${k}${i + 1}`, "rgba(47,122,87,.9)")); if (k === "genRows" || k === "penRows") v.forEach(([y0, y1]) => { circ(F.shinX, (y0 + y1) / 2 + 2, 15, "新"); circ(F.kyuX, (y0 + y1) / 2 + 2, 15, "旧"); }); }
  else if (Array.isArray(v) && v.length === 4) box(...v, k);
  else if (Array.isArray(v) && v.length === 2 && !/Col$/.test(k)) circ(v[0], v[1], k.startsWith("eq") || k.startsWith("lg") ? 23 : 16, k);
}
for (const [k, r] of Object.entries(REGION)) if (k !== "all") { ctx.lineWidth = 4; ctx.setLineDash([12, 8]); ctx.strokeStyle = "rgba(200,70,44,.7)"; ctx.strokeRect(...r.box); ctx.setLineDash([]); }
fs.writeFileSync(out, await c.encode("png"));
console.log(out);

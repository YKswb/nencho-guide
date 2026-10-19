// usage: node img.mjs <in.png> <out.(webp|png|jpg)> [quality] [x y w h]   (crop is in source pixels)
import fs from "node:fs";
import { createCanvas, loadImage } from "@napi-rs/canvas";
const [inPath, outPath, qArg = "82", ...crop] = process.argv.slice(2);
const img = await loadImage(fs.readFileSync(inPath));
let [x, y, w, h] = crop.length === 4 ? crop.map(Number) : [0, 0, img.width, img.height];
const c = createCanvas(w, h), ctx = c.getContext("2d");
ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, w, h);
ctx.drawImage(img, x, y, w, h, 0, 0, w, h);
const ext = outPath.split(".").pop().toLowerCase();
const buf = ext === "webp" ? await c.encode("webp", parseInt(qArg, 10)) : ext === "png" ? await c.encode("png") : await c.encode("jpeg", parseInt(qArg, 10));
fs.writeFileSync(outPath, buf);
console.log(outPath, `${w}x${h}`, buf.length, "bytes");

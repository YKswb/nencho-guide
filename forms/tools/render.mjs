// usage: node render.mjs <in.pdf> <outPrefix> <scale> [maxPages]
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");

const [inPath, outPrefix, scaleArg = "2", maxArg = "99"] = process.argv.slice(2);
const scale = parseFloat(scaleArg);
const maxPages = parseInt(maxArg, 10);
const data = new Uint8Array(fs.readFileSync(inPath));
const stdFonts = path.join(require.resolve("pdfjs-dist/package.json"), "..", "standard_fonts") + path.sep;
const cmaps = path.join(require.resolve("pdfjs-dist/package.json"), "..", "cmaps") + path.sep;
const doc = await pdfjs.getDocument({ data, standardFontDataUrl: stdFonts, cMapUrl: cmaps, cMapPacked: true, verbosity: 0 }).promise;
const n = Math.min(doc.numPages, maxPages);
for (let i = 1; i <= n; i++) {
  const page = await doc.getPage(i);
  const vp = page.getViewport({ scale });
  const { canvas, context } = doc.canvasFactory.create(Math.ceil(vp.width), Math.ceil(vp.height));
  context.fillStyle = "#fff"; context.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: context, viewport: vp }).promise;
  const out = `${outPrefix}-${i}.png`;
  fs.writeFileSync(out, canvas.toBuffer("image/png"));
  console.log(out, canvas.width + "x" + canvas.height);
}

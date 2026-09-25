import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";
import toIco from "to-ico";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const source = path.join(root, "public/brand/servetech-icon.png");

function squircleMaskSvg(size, radius) {
  return `<svg width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="white"/></svg>`;
}

/** Resize the brand logo and clip to rounded corners — no extra dark layers. */
async function buildRoundedIcon(size) {
  const cornerRadius = Math.round(size * 0.22);
  const mask = Buffer.from(squircleMaskSvg(size, cornerRadius));

  return sharp(source)
    .rotate()
    .resize(size, size, { fit: "cover", position: "centre" })
    .ensureAlpha()
    .composite([{ input: mask, blend: "dest-in" }])
    .png()
    .toBuffer();
}

async function main() {
  const appDir = path.join(root, "src/app");
  const publicBrand = path.join(root, "public/brand");
  await mkdir(publicBrand, { recursive: true });

  const icon512 = await buildRoundedIcon(512);
  const icon180 = await buildRoundedIcon(180);
  const icon48 = await buildRoundedIcon(48);
  const icon32 = await buildRoundedIcon(32);
  const icon16 = await buildRoundedIcon(16);

  const faviconIco = await toIco([icon16, icon32, icon48]);

  await writeFile(path.join(appDir, "icon.png"), icon512);
  await writeFile(path.join(appDir, "apple-icon.png"), icon180);
  await writeFile(path.join(appDir, "favicon.ico"), faviconIco);
  await writeFile(path.join(publicBrand, "servetech-icon-rounded.png"), icon512);
  await writeFile(path.join(root, "public/favicon.ico"), faviconIco);

  console.log("Generated rounded favicons from original brand logo.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

/**
 * Generates Chrome extension icons from public/applydashlogo.svg
 * Run: node scripts/generate-extension-icons.mjs
 */
import { readFileSync, mkdirSync, writeFileSync } from "fs";
import { Resvg } from "@resvg/resvg-js";

const svgPath = "public/applydashlogo.svg";
const outDir = "extension/icons";
const sizes = [16, 32, 48, 128];

mkdirSync(outDir, { recursive: true });
const svg = readFileSync(svgPath);

for (const size of sizes) {
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: size },
  });
  writeFileSync(`${outDir}/icon-${size}.png`, resvg.render().asPng());
  console.log(`✓ icon-${size}.png`);
}

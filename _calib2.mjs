import sharp from "sharp";
import fs from "node:fs";
const SRC = "public/images/cafe/cafe-scene.webp";
const OUT = "C:/Users/juguyer/Desktop/KIRO/.artifacts/cozy-hover-calib";
fs.mkdirSync(OUT, { recursive: true });
const corners = {
  tl: { left: 600, top: 312, width: 60, height: 50 },
  tr: { left: 1100, top: 300, width: 60, height: 60 },
  bl: { left: 595, top: 555, width: 60, height: 50 },
  br: { left: 1100, top: 545, width: 60, height: 60 },
};
for (const [name, box] of Object.entries(corners)) {
  await sharp(SRC).extract(box).resize(box.width * 4, box.height * 4, { kernel: "nearest" }).toFile(`${OUT}/corner-${name}.png`);
}
console.log("done");

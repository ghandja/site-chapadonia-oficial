const fs = require("fs");
const path = require("path");
const { PNG } = require("pngjs");
const GIFEncoder = require("gif-encoder-2");

const SOURCE = "C:\\Users\\Usuario\\Downloads\\animated-items-and-outfits\\animated-outfits\\outfits\\outfits_anim";
const DEST = "C:\\Users\\Usuario\\Documents\\UniServerZ\\www\\sprites";

function readPNG(filepath) {
  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(filepath);
    stream.pipe(new PNG()).on("parsed", function () {
      resolve({ data: this.data, width: this.width, height: this.height });
    }).on("error", reject);
  });
}

async function processLooktype(lt, dir) {
  const frames = [];
  let width, height;

  // Front-facing direction 3 walk frames: 3_1_1_1.png, 3_1_1_2.png, 3_1_1_3.png, 3_1_1_4.png
  for (let f = 1; f <= 4; f++) {
    const fp = path.join(dir, "3_1_1_" + f + ".png");
    if (!fs.existsSync(fp)) break;
    const png = await readPNG(fp);
    if (!width) { width = png.width; height = png.height; }
    frames.push(png.data);
  }

  // Fallback direction 1 if direction 3 is missing
  if (frames.length < 2) {
    frames.length = 0;
    width = null;
    for (let f = 1; f <= 4; f++) {
      const fp = path.join(dir, "1_1_1_" + f + ".png");
      if (!fs.existsSync(fp)) break;
      const png = await readPNG(fp);
      if (!width) { width = png.width; height = png.height; }
      frames.push(png.data);
    }
  }

  // Fallback single frame
  if (frames.length === 0) {
    const anyFile = fs.readdirSync(dir).find(f => f.endsWith(".png") && !f.includes("template"));
    if (anyFile) {
      const png = await readPNG(path.join(dir, anyFile));
      width = png.width; height = png.height;
      frames.push(png.data);
    }
  }

  if (frames.length === 0 || !width) return;

  const encoder = new GIFEncoder(width, height);
  const outPath = path.join(DEST, "Outfit_" + lt + ".gif");
  const file = fs.createWriteStream(outPath);
  encoder.createReadStream().pipe(file);

  encoder.setRepeat(0);
  encoder.setDelay(180);
  encoder.start();

  for (const frame of frames) {
    encoder.addFrame(frame);
  }
  encoder.finish();

  await new Promise((res, rej) => {
    file.on("finish", () => {
      res();
    });
    file.on("error", rej);
  });
}

async function main() {
  const dirs = fs.readdirSync(SOURCE, { withFileTypes: true }).filter(d => d.isDirectory());
  console.log("Processing " + dirs.length + " looktypes (Strict Front Walk GIFs)...");
  let count = 0;
  for (const dir of dirs) {
    await processLooktype(dir.name, path.join(SOURCE, dir.name));
    count++;
  }
  console.log("\nDone: " + count + "/" + dirs.length);
}

main().catch(console.error);


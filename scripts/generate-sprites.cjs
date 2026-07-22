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
  // Try direction 3 (front) with all animation frames 1-8
  // Format: {animation}_1_1_3.png
  const frames = [];
  let width, height, foundDir;

  for (const tryDir of [3, 2, 4, 1]) {
    frames.length = 0;
    width = null;
    for (let a = 1; a <= 8; a++) {
      const fp = path.join(dir, `${a}_1_1_${tryDir}.png`);
      if (!fs.existsSync(fp)) break;
      const png = await readPNG(fp);
      if (!width) { width = png.width; height = png.height; }
      frames.push(png.data);
    }
    if (frames.length >= 2) { foundDir = tryDir; break; }
  }

  // Fallback: single frame any direction
  if (!foundDir) {
    frames.length = 0;
    width = null;
    for (const tryDir of [3, 2, 1, 4]) {
      const fp = path.join(dir, `1_1_1_${tryDir}.png`);
      if (fs.existsSync(fp)) {
        const png = await readPNG(fp);
        width = png.width; height = png.height;
        frames.push(png.data);
        foundDir = tryDir;
        break;
      }
    }
  }

  if (frames.length === 0) {
    const anyFile = fs.readdirSync(dir).find(f => f.endsWith(".png") && !f.includes("template"));
    if (anyFile) {
      const png = await readPNG(path.join(dir, anyFile));
      width = png.width; height = png.height;
      frames.push(png.data);
    }
  }

  if (frames.length === 0 || !width) {
    console.log(`  SKIP ${lt}`);
    return;
  }

  const encoder = new GIFEncoder(width, height);
  const outPath = path.join(DEST, `Outfit_${lt}.gif`);
  const file = fs.createWriteStream(outPath);
  encoder.createReadStream().pipe(file);

  encoder.setRepeat(0);
  encoder.setDelay(120);
  encoder.start();
  for (const frame of frames) encoder.addFrame(frame);
  encoder.finish();

  await new Promise((res, rej) => {
    file.on("finish", () => { console.log(`  OK ${lt}: ${frames.length} frames, dir=${foundDir}`); res(); });
    file.on("error", rej);
  });
}

async function main() {
  const dirs = fs.readdirSync(SOURCE, { withFileTypes: true }).filter(d => d.isDirectory());
  console.log(`Processing ${dirs.length} looktypes...`);
  let count = 0, animated = 0;
  for (const dir of dirs) {
    const lt = dir.name;
    try {
      const before = fs.existsSync(path.join(DEST, `Outfit_${lt}.gif`)) ? fs.statSync(path.join(DEST, `Outfit_${lt}.gif`)).size : 0;
      await processLooktype(lt, path.join(SOURCE, lt));
      count++;
    } catch (err) {
      console.error(`  ERROR ${lt}: ${err.message}`);
    }
  }
  console.log(`\nDone: ${count}/${dirs.length}`);
}

main().catch(console.error);

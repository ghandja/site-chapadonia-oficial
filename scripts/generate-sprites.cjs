const fs = require("fs");
const path = require("path");
const { PNG } = require("pngjs");
const GIFEncoder = require("gif-encoder-2");

const SOURCE = "C:\\Users\\Usuario\\Downloads\\animated-items-and-outfits\\animated-outfits\\outfits\\outfits_anim";
const DEST = "C:\\Users\\Usuario\\Documents\\UniServerZ\\www\\sprites";

function createAnimatedGif(frames, width, height) {
  return new Promise((resolve, reject) => {
    const encoder = new GIFEncoder(width, height);
    const chunks = [];
    encoder.on("data", (chunk) => chunks.push(chunk));
    encoder.on("end", () => resolve(Buffer.concat(chunks)));
    encoder.on("error", reject);

    encoder.setRepeat(0);
    encoder.setDelay(150);
    encoder.start();

    for (const frame of frames) {
      encoder.addFrame(frame);
    }
    encoder.finish();
  });
}

function readPNG(filepath) {
  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(filepath);
    stream.pipe(new PNG()).on("parsed", function () {
      resolve({ data: this.data, width: this.width, height: this.height });
    }).on("error", reject);
  });
}

async function processLooktype(looktype, dir) {
  const frames = [];
  let width, height;

  for (const f of ["1", "2", "3", "4"]) {
    const fp = path.join(dir, `5_1_1_${f}.png`);
    if (!fs.existsSync(fp)) continue;
    const png = await readPNG(fp);
    if (!width) { width = png.width; height = png.height; }
    frames.push(png.data);
  }

  if (frames.length === 0) {
    // Fallback: use any direction
    for (const d of ["3", "5", "1"]) {
      for (const f of ["1", "2", "3", "4"]) {
        const fp = path.join(dir, `${d}_1_1_${f}.png`);
        if (!fs.existsSync(fp)) continue;
        const png = await readPNG(fp);
        if (!width) { width = png.width; height = png.height; }
        frames.push(png.data);
      }
      if (frames.length > 0) break;
    }
  }

  if (frames.length === 0) {
    // Last resort: single frame from any file
    const anyFile = fs.readdirSync(dir).find(f => f.endsWith(".png") && !f.includes("template"));
    if (anyFile) {
      const png = await readPNG(path.join(dir, anyFile));
      width = png.width; height = png.height;
      frames.push(png.data);
    }
  }

  if (frames.length === 0 || !width) {
    console.log(`  SKIP ${looktype}: no frames found`);
    return;
  }

  const gif = await createAnimatedGif(frames, width, height);
  const outPath = path.join(DEST, `Outfit_${looktype}.gif`);
  fs.writeFileSync(outPath, gif);
  console.log(`  OK ${looktype}: ${frames.length} frames, ${gif.length} bytes`);
}

async function main() {
  const dirs = fs.readdirSync(SOURCE, { withFileTypes: true }).filter(d => d.isDirectory());
  console.log(`Processing ${dirs.length} looktypes...`);

  let count = 0;
  for (const dir of dirs) {
    const looktype = dir.name;
    const fullPath = path.join(SOURCE, looktype);
    try {
      await processLooktype(looktype, fullPath);
      count++;
    } catch (err) {
      console.error(`  ERROR ${looktype}: ${err.message}`);
    }
  }
  console.log(`\nDone. Processed ${count} / ${dirs.length} looktypes.`);
}

main().catch(console.error);

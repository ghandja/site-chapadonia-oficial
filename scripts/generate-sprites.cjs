const fs = require("fs");
const path = require("path");
const { PNG } = require("pngjs");
const GIFEncoder = require("gif-encoder-2");

const SOURCE = "C:\\Users\\Usuario\\Downloads\\animated-items-and-outfits\\animated-outfits\\outfits\\outfits_anim";
const DEST = "C:\\Users\\Usuario\\Documents\\UniServerZ\\www\\sprites";

function createAnimatedGif(frames, width, height) {
  return new Promise((resolve, reject) => {
    const encoder = new GIFEncoder(width, height);
    const file = fs.createWriteStream(path.join(DEST, `Outfit_${looktype}.gif`));
    encoder.createReadStream().pipe(file);

    encoder.setRepeat(0);
    encoder.setDelay(150);
    encoder.start();
    for (const frame of frames) {
      encoder.addFrame(frame);
    }
    encoder.finish();

    file.on("finish", resolve);
    file.on("error", reject);
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

async function processLooktype(lt, dir) {
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
  encoder.setDelay(150);
  encoder.start();
  for (const frame of frames) {
    encoder.addFrame(frame);
  }
  encoder.finish();

  await new Promise((res, rej) => {
    file.on("finish", () => { console.log(`  OK ${lt}: ${frames.length} frames`); res(); });
    file.on("error", rej);
  });
}

async function main() {
  const dirs = fs.readdirSync(SOURCE, { withFileTypes: true }).filter(d => d.isDirectory());
  console.log(`Processing ${dirs.length} looktypes...`);
  let count = 0;
  for (const dir of dirs) {
    looktype = dir.name;
    try {
      await processLooktype(looktype, path.join(SOURCE, looktype));
      count++;
    } catch (err) {
      console.error(`  ERROR ${looktype}: ${err.message}`);
    }
  }
  console.log(`\nDone: ${count}/${dirs.length}`);
}

let looktype;
main().catch(console.error);

import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function crc32(buf) {
  let table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(4 + 4 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);
  const crcTarget = buf.subarray(4, 8 + len);
  buf.writeUInt32BE(crc32(crcTarget), 8 + len);
  return buf;
}

function pointInPolygon(px, py, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0], yi = poly[i][1];
    const xj = poly[j][0], yj = poly[j][1];
    const intersect = ((yi > py) !== (yj > py)) &&
      (px < (xj - xi) * (py - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function createPng(width, height) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowSize);

  // Geometry polygons normalized to 0..1 coordinates
  // Top layer: #F5F5F0
  const topPoly = [
    [0.5, 0.18],
    [0.78, 0.35],
    [0.5, 0.52],
    [0.22, 0.35]
  ];

  // Middle layer: #C2A68C
  const midPoly = [
    [0.22, 0.46],
    [0.5, 0.63],
    [0.78, 0.46],
    [0.5, 0.29]
  ];

  // Bottom layer: #E6D8C3
  const botPoly = [
    [0.22, 0.63],
    [0.5, 0.80],
    [0.78, 0.63],
    [0.5, 0.46]
  ];

  const cornerRadius = 0.22; // rounded squircle radius

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // None filter
    for (let x = 0; x < width; x++) {
      const u = (x + 0.5) / width;
      const v = (y + 0.5) / height;

      // Check rounded rect bound
      const dx = Math.max(0, Math.abs(u - 0.5) - (0.5 - cornerRadius));
      const dy = Math.max(0, Math.abs(v - 0.5) - (0.5 - cornerRadius));
      const dist = Math.sqrt(dx * dx + dy * dy);

      let r = 0, g = 0, b = 0, a = 0;

      if (dist <= cornerRadius) {
        // Base Forest Green: #5D866C (93, 134, 108)
        r = 93;
        g = 134;
        b = 108;
        a = 255;

        // Anti-alias edge
        if (cornerRadius - dist < 0.03) {
          const edgeAlpha = Math.min(1, Math.max(0, (cornerRadius - dist) / 0.03));
          a = Math.round(255 * edgeAlpha);
        }

        // Draw layered brand mark
        if (pointInPolygon(u, v, botPoly)) {
          // Soft Sand: #E6D8C3 (230, 216, 195)
          r = 230; g = 216; b = 195;
        }

        if (pointInPolygon(u, v, midPoly)) {
          // Warm Beige: #C2A68C (194, 166, 140) with 85% blend
          r = Math.round(r * 0.15 + 194 * 0.85);
          g = Math.round(g * 0.15 + 166 * 0.85);
          b = Math.round(b * 0.15 + 140 * 0.85);
        }

        if (pointInPolygon(u, v, topPoly)) {
          // Off White: #F5F5F0 (245, 245, 240)
          r = 245; g = 245; b = 240;
        }
      }

      const pxOffset = rowOffset + 1 + x * 4;
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const idatData = zlib.deflateSync(rawData);
  return Buffer.concat([
    sig,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', idatData),
    makeChunk('IEND', Buffer.alloc(0))
  ]);
}

function createIco(png16, png32) {
  // ICO header: 6 bytes
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type 1 = ICO
  header.writeUInt16LE(2, 4); // 2 images

  // Directory entries: 16 bytes each
  const entry16 = Buffer.alloc(16);
  entry16[0] = 16; // width
  entry16[1] = 16; // height
  entry16[2] = 0;  // palette colors
  entry16[3] = 0;  // reserved
  entry16.writeUInt16LE(1, 4);  // color planes
  entry16.writeUInt16LE(32, 6); // bits per pixel
  entry16.writeUInt32LE(png16.length, 8); // size
  entry16.writeUInt32LE(6 + 16 * 2, 12); // offset

  const entry32 = Buffer.alloc(16);
  entry32[0] = 32;
  entry32[1] = 32;
  entry32[2] = 0;
  entry32[3] = 0;
  entry32.writeUInt16LE(1, 4);
  entry32.writeUInt16LE(32, 6);
  entry32.writeUInt32LE(png32.length, 8);
  entry32.writeUInt32LE(6 + 16 * 2 + png16.length, 12);

  return Buffer.concat([header, entry16, entry32, png16, png32]);
}

// Generate files
const png180 = createPng(180, 180);
const png32 = createPng(32, 32);
const png16 = createPng(16, 16);
const ico = createIco(png16, png32);

fs.writeFileSync(path.resolve('assets/img/apple-touch-icon.png'), png180);
fs.writeFileSync(path.resolve('assets/img/favicon-32x32.png'), png32);
fs.writeFileSync(path.resolve('assets/img/favicon-16x16.png'), png16);
fs.writeFileSync(path.resolve('assets/img/favicon.ico'), ico);
fs.writeFileSync(path.resolve('favicon.ico'), ico);

console.log('✓ All favicon assets generated successfully:');
console.log('  - assets/img/apple-touch-icon.png (180x180)');
console.log('  - assets/img/favicon-32x32.png (32x32)');
console.log('  - assets/img/favicon-16x16.png (16x16)');
console.log('  - assets/img/favicon.ico (multi-res)');
console.log('  - favicon.ico (root)');

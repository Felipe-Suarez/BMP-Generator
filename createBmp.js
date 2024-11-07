// Fonts:
// https://en.wikipedia.org/wiki/BMP_file_format
// http://www.ue.eti.pg.gda.pl/fpgalab/zadania.spartan3/zad_vga_struktura_pliku_bmp_en.html

"use strict";

const fs = require("fs");
const path = require("path");

process.on("unhandledRejection", (error) => {
  console.error("unhandledRejection", error.message);
});

function addConfigToBuffer(buffer, config) {
  let offset = 0;
  Object.values(config).forEach((data) => {
    if (typeof data.value === "string") {
      buffer.write(data.value, offset);
    } else if (typeof data.value === "number") {
      buffer.writeUInt32LE(data.value, offset);
    } else {
      throw new Error("Invalid data type");
    }

    offset += data.byteSize;
  });
}

function getBufferDataParsed(buffer) {
  return JSON.parse(JSON.stringify(buffer)).data;
}

function createFolderIfNotExists(folderName) {
  if (!fs.existsSync(folderName)) fs.mkdirSync(folderName);
}

function createBmp({ sizes, setPixels, bmpName }) {
  const WIDTH = sizes.width;
  const HEIGHT = sizes.height;

  const HeaderSize = 14;
  const DIBHeaderSize = 40;

  const BytesPerPixel = 3;
  const BitsPerPixel = 24;

  const RowByteSize = WIDTH * BytesPerPixel;
  const TotalByteSizePerRow = Math.ceil(RowByteSize / 4) * 4; // rounded up to a multiple of 4 bytes by padding
  const PixelsDataSize = TotalByteSizePerRow * HEIGHT;

  /* bitmap file required structure */

  // Bitmap file header
  const HeaderConfig = {
    signature: {
      value: "BM",
      byteSize: 2,
    },
    fileSize: {
      value: WIDTH * HEIGHT * BytesPerPixel + HeaderSize + DIBHeaderSize,
      byteSize: 4,
    },
    reserved: {
      value: 0, // unused
      byteSize: 4,
    },
    dataOffset: {
      value: HeaderSize + DIBHeaderSize,
      byteSize: 4,
    },
  };

  // DIB Header
  const InfoHeaderConfig = {
    size: {
      value: DIBHeaderSize,
      byteSize: 4,
    },
    width: {
      value: WIDTH,
      byteSize: 4,
    },
    height: {
      value: HEIGHT,
      byteSize: 4,
    },
    planes: {
      value: 1,
      byteSize: 2,
    },
    bitCount: {
      value: BitsPerPixel,
      byteSize: 2,
    },
    compression: {
      value: 0, // no compression
      byteSize: 4,
    },
    sizeImage: {
      value: 0, // no compression can be set to 0
      byteSize: 4,
    },
    pixelsPerMeterX: {
      value: 0, // no resolution horizontal
      byteSize: 4,
    },
    pixelsPerMeterY: {
      value: 0, // no resolution vertical
      byteSize: 4,
    },
    colorsUsed: {
      value: 0, // no palette used
      byteSize: 4,
    },
    colorsImportant: {
      value: 0, // no important colors
      byteSize: 4,
    },
  };

  const headerBuffer = Buffer.alloc(HeaderSize);
  addConfigToBuffer(headerBuffer, HeaderConfig);

  const dibHeaderBuffer = Buffer.alloc(DIBHeaderSize);
  addConfigToBuffer(dibHeaderBuffer, InfoHeaderConfig);

  const pixelsBuffer = Buffer.alloc(PixelsDataSize);
  setPixels(pixelsBuffer, { TotalByteSizePerRow, BytesPerPixel });

  /* save the image */

  createFolderIfNotExists(bmpName);

  const outputFile = path.join(bmpName, `image.bmp`);

  const bmpParts = [headerBuffer, dibHeaderBuffer, pixelsBuffer];

  const output = Buffer.concat(bmpParts);

  console.log(`Image created in ${outputFile}`);

  fs.writeFileSync(outputFile, output);

  /* save the image data in base 10, hex and binary */

  const folderName = path.join(bmpName, "data");
  createFolderIfNotExists(folderName);

  const outputDataFileInDecimalInt = path.join(folderName, "decimal-int.txt");
  const outputDataFileInHex = path.join(folderName, "hex.txt");
  const outputDataFileInBinary = path.join(folderName, "binary.txt");

  const bmpPartsDataInDecimalInt = bmpParts.map(getBufferDataParsed);
  const bmpPartsDataInHex = bmpParts.map((part) =>
    getBufferDataParsed(part).map((byte) => byte.toString(16).padStart(2, "0"))
  );
  const bmpPartsDataInBinary = bmpParts.map((part) =>
    getBufferDataParsed(part).map((byte) => byte.toString(2).padStart(8, "0"))
  );

  fs.writeFileSync(outputDataFileInDecimalInt, bmpPartsDataInDecimalInt.join("\n\n"));
  fs.writeFileSync(outputDataFileInHex, bmpPartsDataInHex.join("\n\n"));
  fs.writeFileSync(outputDataFileInBinary, bmpPartsDataInBinary.join("\n\n"));

  console.log(
    `Image data saved in ${outputDataFileInDecimalInt}, ${outputDataFileInHex} and ${outputDataFileInBinary}`
  );
}

module.exports = createBmp;

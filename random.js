"use strict";

const createBmp = require("./createBmp");

const WIDTH = process.argv[2];
const HEIGHT = process.argv[3];

if (!WIDTH || !HEIGHT) {
  console.error("Please provide width and height as arguments");
  process.exit(1);
}

const sizes = {
  width: Number(WIDTH),
  height: Number(HEIGHT),
};

const setPixels = (buffer, config) => {
  for (let rowPosition = 0; rowPosition < sizes.height; rowPosition++) {
    for (let pixelPosition = 0; pixelPosition < sizes.width; pixelPosition++) {
      const currentRowInitialBufferPosition = rowPosition * config.TotalByteSizePerRow;
      const currentPixelBufferPositionInRow = pixelPosition * config.BytesPerPixel;
      const currentPixelBufferPosition = currentRowInitialBufferPosition + currentPixelBufferPositionInRow;

      // BGR byte positions in the pixel
      const BlueOffset = currentPixelBufferPosition;
      const GreenOffset = currentPixelBufferPosition + 1;
      const RedOffset = currentPixelBufferPosition + 2;

      const getRandomColor = () => Math.floor(Math.random() * 256);

      buffer.writeUInt8(getRandomColor(), BlueOffset);
      buffer.writeUInt8(getRandomColor(), GreenOffset);
      buffer.writeUInt8(getRandomColor(), RedOffset);
    }
  }
};

createBmp({ sizes, setPixels, bmpName: "random" });

"use strict";

const createBmp = require("./createBmp");

process.stdin.setEncoding("utf8");

let ascii = "";

console.log("*Press Ctrl + D to finish*");
console.log("\nPaste your ASCII art below (dont type anything, just paste):");

process.stdin.on("data", (chunk) => {
  ascii += chunk;
});

process.stdin.on("end", () => {
  if (!ascii.trim()) {
    console.error("Please provide an ASCII art");
    process.exit(1);
  }

  console.log("Processing ASCII art...");
  console.log(ascii);

  const asciiLines = ascii.split("\n");
  asciiLines.reverse();

  const longestLine = Math.max(...asciiLines.map((line) => line.length));

  const scaleFactor = 10;

  const sizes = {
    width: longestLine * scaleFactor,
    height: asciiLines.length * scaleFactor,
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

        // Map the current pixel back to the ASCII art character
        const asciiRow = Math.floor(rowPosition / scaleFactor);
        const asciiCol = Math.floor(pixelPosition / scaleFactor);

        const asciiLine = asciiLines[asciiRow] || " ";
        const asciiChar = asciiLine[asciiCol] || " ";

        const common_background_characters = [" ", ".", ",", ":", ";", "-", "_", "'", "`", " "];

        const color = common_background_characters.includes(asciiChar) ? 255 : 0;

        buffer.writeUInt8(color, BlueOffset);
        buffer.writeUInt8(color, GreenOffset);
        buffer.writeUInt8(color, RedOffset);
      }
    }
  };

  createBmp({ sizes, setPixels, bmpName: "ascii" });
});

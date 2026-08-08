import { Buffer } from "buffer";
import * as FileSystem from "expo-file-system/legacy";

const getBase64Image = async (uri: string): Promise<string> => {
  if (uri.startsWith("data:")) return uri.split(",")[1]!;
  if (uri.startsWith("file://") || uri.startsWith("/") || uri.includes(":/")) {
    return await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
  }
  return uri;
};

const decodeImage = (
  base64Image: string,
): { data: Uint8Array; width: number; height: number } => {
  const buffer = Buffer.from(base64Image, "base64");
  const isPNG =
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47;

  if (isPNG) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const UPNG = require("upng-js");
    const img = UPNG.decode(buffer);
    const rgba = new Uint8Array(UPNG.toRGBA8(img)[0]);
    return {
      data: rgba,
      width: img.width,
      height: img.height,
    };
  } else {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const jpeg = require("jpeg-js");
    const img = jpeg.decode(buffer, { useTArray: true });
    return {
      data: new Uint8Array(img.data),
      width: img.width,
      height: img.height,
    };
  }
};

/**
 * Resizes RGBA image data using Bilinear Interpolation.
 * This preserves thin text lines and borders much better than Nearest Neighbor,
 * preventing pixelated or broken letters on receipt prints.
 */
const resizeRGBA = (
  data: Uint8Array,
  width: number,
  height: number,
  newWidth: number,
  newHeight: number,
): Uint8Array => {
  const newData = new Uint8Array(newWidth * newHeight * 4);
  const xRatio = width / newWidth;
  const yRatio = height / newHeight;

  for (let y = 0; y < newHeight; y++) {
    const srcY = Math.max(0, Math.min(height - 1, (y + 0.5) * yRatio - 0.5));
    const yFloor = Math.floor(srcY);
    const yCeil = Math.min(height - 1, yFloor + 1);
    const yWeight = srcY - yFloor;

    for (let x = 0; x < newWidth; x++) {
      const srcX = Math.max(0, Math.min(width - 1, (x + 0.5) * xRatio - 0.5));
      const xFloor = Math.floor(srcX);
      const xCeil = Math.min(width - 1, xFloor + 1);
      const xWeight = srcX - xFloor;

      const idx00 = (yFloor * width + xFloor) * 4;
      const idx10 = (yFloor * width + xCeil) * 4;
      const idx01 = (yCeil * width + xFloor) * 4;
      const idx11 = (yCeil * width + xCeil) * 4;

      for (let c = 0; c < 4; c++) {
        const val =
          data[idx00 + c]! * (1 - xWeight) * (1 - yWeight) +
          data[idx10 + c]! * xWeight * (1 - yWeight) +
          data[idx01 + c]! * (1 - xWeight) * yWeight +
          data[idx11 + c]! * xWeight * yWeight;

        newData[(y * newWidth + x) * 4 + c] = Math.round(val);
      }
    }
  }
  return newData;
};

/**
 * Determines if a pixel should be printed as black on a thermal printer.
 * 1. Blends transparent pixels against a white background (receipt paper is white).
 * 2. Uses perceived luminance to accurately threshold colored text (like blue/red logos).
 * 3. Uses a slightly higher threshold (150) to make thin font lines legible on low-heat printers.
 */
const isPixelBlack = (
  r: number,
  g: number,
  b: number,
  a: number,
  threshold = 150,
): boolean => {
  const alpha = a / 255;
  const rBlended = r * alpha + 255 * (1 - alpha);
  const gBlended = g * alpha + 255 * (1 - alpha);
  const bBlended = b * alpha + 255 * (1 - alpha);

  // Perceived luminance formula (ITU-R BT.601)
  const luminance = 0.299 * rBlended + 0.587 * gBlended + 0.114 * bBlended;
  return luminance < threshold;
};

export const compileImageForZpl = async (
  uri: string,
  targetWidth: number,
): Promise<{
  hex: string;
  totalBytes: number;
  rowBytes: number;
  height: number;
}> => {
  const b64 = await getBase64Image(uri);
  const { data, width, height } = decodeImage(b64);
  const targetHeight = Math.round((height / width) * targetWidth);
  const resizedData = resizeRGBA(
    data,
    width,
    height,
    targetWidth,
    targetHeight,
  );

  const rowBytes = Math.ceil(targetWidth / 8);
  const totalBytes = rowBytes * targetHeight;

  let hexString = "";

  for (let y = 0; y < targetHeight; y++) {
    let byteVal = 0;
    for (let x = 0; x < rowBytes * 8; x++) {
      let isBlack = 0;
      if (x < targetWidth) {
        const idx = (y * targetWidth + x) * 4;
        if (
          isPixelBlack(
            resizedData[idx]!,
            resizedData[idx + 1]!,
            resizedData[idx + 2]!,
            resizedData[idx + 3]!,
          )
        ) {
          isBlack = 1;
        }
      }

      const bitIdx = x % 8;
      if (isBlack) {
        byteVal |= 1 << (7 - bitIdx);
      }

      if (bitIdx === 7) {
        hexString += byteVal.toString(16).padStart(2, "0").toUpperCase();
        byteVal = 0;
      }
    }
  }

  return {
    hex: hexString,
    totalBytes,
    rowBytes,
    height: targetHeight,
  };
};

export const compileImageForEzpl = async (
  uri: string,
  targetWidth: number,
): Promise<{ binary: Buffer; height: number; widthBytes: number }> => {
  const b64 = await getBase64Image(uri);
  const { data, width, height } = decodeImage(b64);
  const targetHeight = Math.round((height / width) * targetWidth);
  const resizedData = resizeRGBA(
    data,
    width,
    height,
    targetWidth,
    targetHeight,
  );

  const widthBytes = Math.ceil(targetWidth / 8);
  const buffer = Buffer.alloc(widthBytes * targetHeight);

  for (let y = 0; y < targetHeight; y++) {
    for (let x = 0; x < widthBytes * 8; x++) {
      let isBlack = 0;
      if (x < targetWidth) {
        const idx = (y * targetWidth + x) * 4;
        if (
          isPixelBlack(
            resizedData[idx]!,
            resizedData[idx + 1]!,
            resizedData[idx + 2]!,
            resizedData[idx + 3]!,
          )
        ) {
          isBlack = 1;
        }
      }

      const byteIdx = Math.floor(x / 8);
      const bitIdx = x % 8;
      if (isBlack) {
        buffer[y * widthBytes + byteIdx] |= 1 << (7 - bitIdx);
      }
    }
  }

  return {
    binary: buffer,
    height: targetHeight,
    widthBytes,
  };
};

export const compileImageForBoth = async (
  uri: string,
  targetWidth: number,
): Promise<{
  zplHex: string;
  zplTotalBytes: number;
  zplRowBytes: number;
  ezplBinary: Buffer;
  height: number;
  widthBytes: number;
}> => {
  const b64 = await getBase64Image(uri);
  const { data, width, height } = decodeImage(b64);
  const targetHeight = Math.round((height / width) * targetWidth);
  const resizedData = resizeRGBA(
    data,
    width,
    height,
    targetWidth,
    targetHeight,
  );

  const widthBytes = Math.ceil(targetWidth / 8);
  const ezplBinary = Buffer.alloc(widthBytes * targetHeight);
  let zplHex = "";

  for (let y = 0; y < targetHeight; y++) {
    let byteVal = 0;
    for (let x = 0; x < widthBytes * 8; x++) {
      let isBlack = 0;
      if (x < targetWidth) {
        const idx = (y * targetWidth + x) * 4;
        if (
          isPixelBlack(
            resizedData[idx]!,
            resizedData[idx + 1]!,
            resizedData[idx + 2]!,
            resizedData[idx + 3]!,
          )
        ) {
          isBlack = 1;
        }
      }
      const byteIdx = Math.floor(x / 8);
      const bitIdx = x % 8;
      if (isBlack) {
        ezplBinary[y * widthBytes + byteIdx] |= 1 << (7 - bitIdx);
        byteVal |= 1 << (7 - bitIdx);
      }
      if (bitIdx === 7) {
        zplHex += byteVal.toString(16).padStart(2, "0").toUpperCase();
        byteVal = 0;
      }
    }
  }

  return {
    zplHex,
    zplTotalBytes: widthBytes * targetHeight,
    zplRowBytes: widthBytes,
    ezplBinary,
    height: targetHeight,
    widthBytes,
  };
};

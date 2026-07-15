import sharp from "sharp";
import { randomId } from "../utils/id";
import { saveFile } from "./storageService";

const FULL_MAX_DIMENSION = 1920;
const THUMB_WIDTH = 480;
const FULL_QUALITY = 82;
const THUMB_QUALITY = 75;

export const processAndStoreImage = async (buffer: Buffer): Promise<string> => {
  const id = randomId();
  const fullFilename = `${id}.webp`;
  const thumbFilename = `${id}-thumb.webp`;

  const source = sharp(buffer).rotate();

  const [full, thumb] = await Promise.all([
    source.clone().resize({ width: FULL_MAX_DIMENSION, height: FULL_MAX_DIMENSION, fit: "inside", withoutEnlargement: true }).webp({ quality: FULL_QUALITY }).toBuffer(),
    source.clone().resize({ width: THUMB_WIDTH, withoutEnlargement: true }).webp({ quality: THUMB_QUALITY }).toBuffer(),
  ]);

  const [fullUrl] = await Promise.all([
    saveFile(fullFilename, full, "image/webp"),
    saveFile(thumbFilename, thumb, "image/webp"),
  ]);

  return fullUrl;
};

export const processAndStoreImages = (buffers: Buffer[]): Promise<string[]> =>
  Promise.all(buffers.map(processAndStoreImage));

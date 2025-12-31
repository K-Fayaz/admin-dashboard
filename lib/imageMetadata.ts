import sharp from 'sharp';

export async function getImageMetadata(imagePath: string) {
  const response = await fetch(imagePath);
  const buffer = await response.arrayBuffer();
  const metadata = await sharp(Buffer.from(buffer)).metadata();
  return metadata;
}

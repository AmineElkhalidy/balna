/**
 * Twitter/X reuses the OG card. Re-exporting from the OG image keeps both
 * platforms aligned and avoids generating two near-identical PNGs.
 */
export {
  alt,
  size,
  contentType,
  generateImageMetadata,
  default,
} from "./opengraph-image";

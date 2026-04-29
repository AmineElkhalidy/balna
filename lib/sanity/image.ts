import imageUrlBuilder, {
  type SanityImageSource,
} from "@sanity/image-url";
import { dataset, projectId } from "@/sanity/env";

const builder = imageUrlBuilder({ projectId, dataset });

/**
 * Returns a Sanity image URL builder. Use chainable params:
 *
 *   urlFor(image).width(800).height(1000).fit("crop").url()
 *
 * Safe to import in both Server and Client Components — only builds a URL
 * string, no API calls.
 */
export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}

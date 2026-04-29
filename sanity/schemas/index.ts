import type { SchemaTypeDefinition } from "sanity";
import { brand } from "./brand";
import { product } from "./product";
import { siteSettings } from "./siteSettings";

export const schemaTypes: SchemaTypeDefinition[] = [brand, product, siteSettings];

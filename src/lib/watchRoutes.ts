export type WatchRouteParts = {
  brand_name?: string | null;
  brand?: string | null;
  collection_name?: string | null;
  collection?: string | null;
  model_name?: string | null;
  model?: string | null;
  reference_number?: string | null;
};

export function normalizeNamePart(value: string | null | undefined) {
  return value?.trim().replace(/\s+/g, " ") ?? "";
}

function stripRepeatedCollection(collection: string, model: string) {
  const normalizedCollection = collection.toLowerCase();
  const normalizedModel = model.toLowerCase();

  if (normalizedModel === normalizedCollection) {
    return "";
  }

  if (normalizedModel.startsWith(`${normalizedCollection} `)) {
    return model.slice(collection.length).trim();
  }

  return model;
}

export function watchDisplayName(watch: WatchRouteParts) {
  const brand = normalizeNamePart(watch.brand_name ?? watch.brand);
  const collection = normalizeNamePart(
    watch.collection_name ?? watch.collection,
  );
  const model = stripRepeatedCollection(
    collection,
    normalizeNamePart(watch.model_name ?? watch.model),
  );

  return [brand, collection, model].filter(Boolean).join(" ");
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function watchSlug(watch: WatchRouteParts) {
  return slugify(
    [watchDisplayName(watch), watch.reference_number].filter(Boolean).join(" "),
  );
}

export function reviewParagraphs(review: string | null | undefined) {
  if (!review) {
    return [
      "This watch does not have an AI wearability review yet. Once the summary is added, it will appear here for a quick collector-style read.",
    ];
  }

  const explicitParagraphs = review
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  if (explicitParagraphs.length > 1) {
    return explicitParagraphs;
  }

  return review
    .replace(/\s+/g, " ")
    .split(/(?<=\.)\s+(?=(?:A major|One of|The biggest|This watch|For many|Enthusiasts|The key|Where|In short)\b)/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

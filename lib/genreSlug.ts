/** Convert a display genre name to a URL slug (e.g. "Science Fiction" → "science-fiction"). */
export function genreToSlug(genre: string): string {
  return genre.toLowerCase().replace(/\s+/g, "-");
}

/** Convert a genre slug back to a display name for API queries. */
export function slugToGenreName(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function genreToCategorySlug(genre: string): string {
  return genre.trim().toLowerCase().replace(/\s+/g, "-");
}

export function categorySlugToGenre(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function genreCategoryPath(genre: string): string {
  return `/category/${genreToCategorySlug(genre)}`;
}

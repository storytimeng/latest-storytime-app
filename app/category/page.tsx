import { redirect } from "next/navigation";
import { genreToCategorySlug } from "@/lib/genre";

export default async function CategoryIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ genre?: string }>;
}) {
  const { genre } = await searchParams;

  if (genre?.trim()) {
    redirect(`/category/${genreToCategorySlug(genre)}`);
  }

  redirect("/all-genres");
}

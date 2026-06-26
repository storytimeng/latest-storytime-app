import { Metadata } from "next";
import { CategoryView } from "@/views";
import { APP_CONFIG } from "@/config/app";
import React from "react";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const raw = decodeURIComponent(id);
  const genreName = raw
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const title = `${genreName} Stories`;
  const description = `Discover the best ${genreName.toLowerCase()} stories on Storytime. Read, enjoy, and explore a wide collection of ${genreName.toLowerCase()} fiction written by talented authors.`;
  const url = `${APP_CONFIG.url}/all-genres/${encodeURIComponent(raw)}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: APP_CONFIG.name,
      images: [{ url: `${APP_CONFIG.url}${APP_CONFIG.images.banner}`, width: 1200, height: 630, alt: title }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${APP_CONFIG.url}${APP_CONFIG.images.banner}`],
    },
  };
}

const GenrePage = async ({ params }: Props) => {
  const { id } = await params;
  return <CategoryView categorySlug={decodeURIComponent(id)} type="genre" />;
};

export default GenrePage;

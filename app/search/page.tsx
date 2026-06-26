import React from "react";
import { Metadata } from "next";
import { searchView as SearchView } from "@/views";
import { APP_CONFIG } from "@/config/app";

export const metadata: Metadata = {
  title: "Search Stories",
  description: "Search thousands of stories on Storytime by title, author, or genre. Discover African fiction, romance, thriller, drama and more.",
  alternates: { canonical: `${APP_CONFIG.url}/search` },
  openGraph: {
    title: "Search Stories | Storytime",
    description: "Search thousands of stories on Storytime by title, author, or genre.",
    url: `${APP_CONFIG.url}/search`,
    siteName: APP_CONFIG.name,
    images: [{ url: `${APP_CONFIG.url}${APP_CONFIG.images.banner}`, width: 1200, height: 630, alt: "Search Stories on Storytime" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Search Stories | Storytime",
    description: "Search thousands of stories on Storytime by title, author, or genre.",
    images: [`${APP_CONFIG.url}${APP_CONFIG.images.banner}`],
  },
};

const SearchPage = () => {
  return (
    <div>
      <SearchView />
    </div>
  );
};

export default SearchPage;

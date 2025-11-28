"use client";

import { useParams } from "next/navigation";
import { PageHeader, StoryGroup, StoriesCarousel } from "@/components/reusables";
import { useStories } from "@/src/hooks/useStories";

const CategoryView = () => {
  const params = useParams();
  const categorySlug = params?.slug as string;
  
  // Convert slug to readable genre name
  const genreName = categorySlug
    ?.split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  // Fetch stories for this genre
  const { stories, isLoading } = useStories({
    genre: genreName,
    limit: 50,
  });

  // Featured stories for carousel
  const featuredStories = stories.slice(0, 5);
  const remainingStories = stories.slice(5);

  return (
    <div className="min-h-screen px-4 pt-4 pb-20 bg-accent-shade-1">
      <PageHeader title={genreName || "Category"} showBackButton />

      <div className="mt-6 space-y-6">
        {/* Featured Carousel */}
        {isLoading ? (
          <div className="h-52 bg-accent-colour animate-pulse rounded-xl" />
        ) : featuredStories.length > 0 ? (
          <>
            <div>
              <h2 className="body-text-small-medium-auto text-black mb-2">
                Featured {genreName} Stories
              </h2>
              <StoriesCarousel
                stories={featuredStories}
                autoPlay={true}
                autoPlayInterval={4000}
                showControls={true}
                showDots={true}
              />
            </div>

            {/* All Stories */}
            {remainingStories.length > 0 && (
              <StoryGroup
                title={`All ${genreName} Stories`}
                stories={remainingStories}
                showSeeAll={false}
                layout="grid"
              />
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="mb-4 text-6xl">📚</div>
            <h3 className="text-lg font-bold text-grey-3 mb-2">
              No stories found
            </h3>
            <p className="text-sm text-grey-2">
              No {genreName} stories available at the moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryView;

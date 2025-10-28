"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/reusables/customUI/pageHeader";
import StoryForm from "@/components/reusables/form/storyForm";
import type {
  StoryFormData,
  Chapter,
  Part,
  StoryViewProps,
} from "@/types/story";

// Mock API functions - replace with actual API calls
const mockFetchStory = async (id: string): Promise<StoryFormData> => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    id,
    title: "The Lost Ship",
    collaborate: "@penname",
    description: `The sons of the morning ascended to the heavenly court, having been summoned by Elohim Himself.

The archangels rode their horses—Lucifer on his silver stallion, Michael on his chestnut stallion, and Gabriel on his golden stallion. Behind them, their winged hosts followed.

A disgruntled look was etched on Lucifer's face. Only curiosity and wonder filled Gabriel's and Michael's.

They knew this was the general assembly where Elohim would finally share his upcoming plans for the cosmos.`,
    selectedGenres: ["Fantasy", "Adventure"],
    language: "English",
    goAnonymous: true,
    onlyOnStorytime: true,
    trigger: true,
    copyright: false,
    storyStatus: "In Progress",
    coverImage: "/images/nature.jpg",
  };
};

const mockSaveStory = async (
  data: StoryFormData,
  chapters?: Chapter[],
  parts?: Part[]
): Promise<{ id: string; success: boolean }> => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // TODO: Replace with actual API call
  // console.log("Saving story:", { data, chapters, parts });

  return {
    id: data.id || `story_${Date.now()}`,
    success: true,
  };
};

const StoryView: React.FC<StoryViewProps> = ({ mode, storyId }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [initialData, setInitialData] = useState<
    Partial<StoryFormData> | undefined
  >();
  const [dataLoaded, setDataLoaded] = useState(mode === "create");

  // Load existing story data for edit mode
  React.useEffect(() => {
    if (mode === "edit" && storyId && !dataLoaded) {
      const loadStory = async () => {
        try {
          setIsLoading(true);
          const storyData = await mockFetchStory(storyId);
          setInitialData(storyData);
          setDataLoaded(true);
        } catch (error) {
          console.error("Failed to load story:", error);
          // Handle error - maybe show toast or redirect
        } finally {
          setIsLoading(false);
        }
      };

      loadStory();
    }
  }, [mode, storyId, dataLoaded]);

  // Handle form submission
  const handleSubmit = useCallback(
    async (formData: StoryFormData, chapters?: Chapter[], parts?: Part[]) => {
      try {
        setIsLoading(true);

        const result = await mockSaveStory(formData, chapters, parts);

        if (result.success) {
          // Show success message
          // TODO: Replace with proper success notification
          // console.log("Story saved successfully!");

          // Navigate based on action
          if (formData.storyStatus === "Draft") {
            router.push("/my-stories?tab=drafts");
          } else {
            router.push(`/story/${result.id}`);
          }
        }
      } catch (error) {
        console.error("Failed to save story:", error);
        // Handle error - show toast notification
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  // Handle cancel action
  const handleCancel = useCallback(() => {
    if (mode === "edit") {
      router.push("/my-stories");
    } else {
      router.push("/app/pen");
    }
  }, [mode, router]);

  // Determine page title and back link
  const pageTitle = mode === "edit" ? "Edit Story" : "New Story";
  const backLink = mode === "edit" ? "/my-stories" : "/app/pen";

  // Show loading state while fetching data
  if (mode === "edit" && !dataLoaded) {
    return (
      <div className="min-h-screen bg-accent-shade-1 max-w-[28rem] mx-auto">
        <PageHeader
          title={pageTitle}
          backLink={backLink}
          className="px-4 pt-5 pb-4"
        />
        <div className="px-4 flex items-center justify-center py-20">
          <div className="text-primary-colour">Loading story...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-accent-shade-1 max-w-[28rem] mx-auto">
      {/* Page Header */}
      <PageHeader
        title={pageTitle}
        backLink={backLink}
        className="px-4 pt-5 pb-4"
        titleClassName="text-xl text-primary-colour font-bold"
      />

      {/* Story Form */}
      <div className="px-4">
        <StoryForm
          mode={mode}
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default StoryView;

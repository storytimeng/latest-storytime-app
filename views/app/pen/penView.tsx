"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Tabs, Tab } from "@heroui/tabs";
import { Button } from "@heroui/button";
import {
  ArrowLeft,
  X,
  Plus,
  BookOpen,
  Library,
  NotebookPenIcon,
} from "lucide-react";

import { Magnetik_Bold, Magnetik_Medium, Magnetik_Regular } from "@/lib/font";
import { StoryCard } from "@/components/reusables/customUI";
import { normalizeStoryStatus } from "@/components/reusables/customUI/StoryStatusIcon";
import { useRouter, useSearchParams } from "next/navigation";
import { Skeleton } from "@heroui/skeleton";
import { rewriteForCapacitor } from "@/lib/linkRewrite";

import { useUserProfile } from "@/src/hooks/useUserProfile";
import { useLibrary } from "@/src/hooks/useLibrary";
import { useDeleteStory } from "@/src/hooks/useStoryMutations";
import { useStateCachedFetch } from "@/src/hooks/useStateCachedFetch";
import { useRoutePrefetch } from "@/src/hooks/useStateCachePrefetch";
import { APP_CACHE_KEYS } from "@/src/stores/dataCacheKeys";
import type { StoryResponseDto } from "@/src/client/types.gen";

// Locally extend StoryResponseDto for UI needs
type ExtendedStory = StoryResponseDto & {
  lastEdited?: string;
  writingDate?: string;
  updatedAt?: string;
  status?: string;
  storyStatus?: string;
};

type TabKey = "Recent" | "Ongoing" | "Published" | "Drafts";

function storyStatusKind(story: ExtendedStory) {
  return normalizeStoryStatus(story.storyStatus || story.status);
}

const PEN_CACHE_KEY = APP_CACHE_KEYS.myLibrary;

const VALID_TABS: TabKey[] = ["Recent", "Ongoing", "Published", "Drafts"];

const PenView = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    router.prefetch("/");
    router.prefetch("/library");
    router.prefetch("/new-story");
  }, [router]);

  const penCache = useStateCachedFetch<any[]>(PEN_CACHE_KEY);
  useRoutePrefetch(["/", "/library", "/new-story", "/home"]);

  const urlTab = searchParams.get("tab") as TabKey | null;
  const urlView = searchParams.get("view");
  const initialTab: TabKey =
    urlTab && VALID_TABS.includes(urlTab) ? urlTab : "Recent";

  const [selectedTab, setSelectedTab] = useState<TabKey>(initialTab);
  const [showAllStories, setShowAllStories] = useState(
    urlView === "all" || Boolean(urlTab && VALID_TABS.includes(urlTab)),
  );

  useEffect(() => {
    const t = searchParams.get("tab") as TabKey | null;
    const v = searchParams.get("view");
    if (t && VALID_TABS.includes(t)) {
      setSelectedTab(t);
      setShowAllStories(true);
    } else if (v === "all") {
      setShowAllStories(true);
    } else if (!v && !t) {
      setShowAllStories(false);
    }
  }, [searchParams]);

  const updatePenUrl = (viewAll: boolean, tab: TabKey = selectedTab) => {
    const params = new URLSearchParams(searchParams.toString());
    if (viewAll) {
      params.set("view", "all");
      params.set("tab", tab);
    } else {
      params.delete("view");
      params.delete("tab");
    }
    const qs = params.toString();
    router.replace(qs ? `/pen?${qs}` : "/pen", { scroll: false });
  };
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [storyToDelete, setStoryToDelete] = useState<{
    id: string | number;
    title: string;
  } | null>(null);
  const deleteCountdown = useRef(5);
  const countdownInterval = useRef<NodeJS.Timeout | null>(null);
  const [canDelete, setCanDelete] = useState(false);
  const [countdownDisplay, setCountdownDisplay] = useState(5);

  // Get current user profile
  const { user } = useUserProfile();
  // Fetch stories from user's library
  const { stories, isLoading, mutate } = useLibrary();

  // Mirror the live result into the state cache so a hard reload
  // / cold start lands on a populated list, not a spinner.
  useEffect(() => {
    if (stories && stories.length > 0) {
      penCache.writeBack(stories);
    }
  }, [stories, penCache]);

  // Filter stories by tab. Prefer the live fetch; fall back to the
  // cached value so a cold start renders immediately.
  const effectiveStories = useMemo(
    () =>
      stories && stories.length > 0 ? stories : (penCache.cachedValue ?? []),
    [stories, penCache.cachedValue],
  );

  // Delete story hook
  const { deleteStory, isDeleting } = useDeleteStory();

  // Filter stories by tab
  const filteredStories = useMemo(() => {
    if (!effectiveStories) return [];
    switch (selectedTab) {
      case "Recent":
        return [...effectiveStories].sort(
          (a, b) =>
            new Date(b.lastEdited || b.writingDate || b.updatedAt).getTime() -
            new Date(a.lastEdited || a.writingDate || a.updatedAt).getTime(),
        );
      case "Ongoing":
        return effectiveStories.filter(
          (story: ExtendedStory) => storyStatusKind(story) === "ongoing",
        );
      case "Published":
        return effectiveStories.filter(
          (story: ExtendedStory) => storyStatusKind(story) === "completed",
        );
      case "Drafts":
        return effectiveStories.filter(
          (story: ExtendedStory) => storyStatusKind(story) === "draft",
        );
      default:
        return effectiveStories;
    }
  }, [selectedTab, effectiveStories]);

  const hasStories = filteredStories.length > 0;

  const handleEditStory = (storyId: string | number) => {
    router.push(rewriteForCapacitor(`/edit-story/${storyId}`));
  };

  // Find story by id from filteredStories
  const handleDeleteStory = (storyId: string | number) => {
    const story = filteredStories.find((s: ExtendedStory) => s.id === storyId);
    if (story) {
      setStoryToDelete({ id: storyId, title: (story as ExtendedStory).title });
      deleteCountdown.current = 5;
      setCountdownDisplay(5);
      setCanDelete(false);
      setIsDeleteModalOpen(true);
    }
  };

  // Countdown timer for delete button
  useEffect(() => {
    if (isDeleteModalOpen) {
      deleteCountdown.current = 5;
      setCountdownDisplay(5);
      setCanDelete(false);

      countdownInterval.current = setInterval(() => {
        deleteCountdown.current -= 1;
        setCountdownDisplay(deleteCountdown.current);
        if (deleteCountdown.current <= 0) {
          setCanDelete(true);
          if (countdownInterval.current) {
            clearInterval(countdownInterval.current);
          }
        }
      }, 1000);
    }

    return () => {
      if (countdownInterval.current) {
        clearInterval(countdownInterval.current);
      }
    };
  }, [isDeleteModalOpen]);

  const confirmDelete = async () => {
    if (storyToDelete) {
      const success = await deleteStory(String(storyToDelete.id));

      if (success) {
        // Optimistically update the UI by refetching stories
        mutate();
        console.log("✅ Story deleted and list refreshed");
      }

      setIsDeleteModalOpen(false);
      setStoryToDelete(null);
    }
  };

  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
    setStoryToDelete(null);
  };

  const handleViewStory = (storyId: string | number) => {
    router.push(rewriteForCapacitor(`/story/${storyId}`));
  };

  // Empty State Component (when user has no stories at all)
  const EmptyState = () => (
    <div className="relative mx-auto max-w-[28rem] md:max-w-3xl lg:max-w-5xl xl:max-w-6xl min-h-screen bg-accent-shade-1">
      {/* Library Button */}
      <div className="top-4 right-4 z-10 absolute">
        <Button
          className={`bg-primary-shade-6 text-universal-white px-4 rounded-full text-[10px] ${Magnetik_Regular.className}`}
          size="sm"
          onPress={() => router.push("/library")}
        >
          <Library className="w-3 h-3" />
          Library
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex flex-col justify-center items-center px-4 min-h-screen">
        {/* Illustration */}
        <div className="flex justify-center items-center bg-complimentary-colour/10 mb-8 rounded-2xl w-32 h-32">
          <BookOpen className="w-20 h-20 text-complimentary-colour" />
        </div>

        {/* Title */}
        <h1
          className={`text-xl text-primary-colour text-center mb-12 ${Magnetik_Bold.className}`}
        >
          Write a new story on Storytime
        </h1>

        {/* Create Story Button */}

        <Button
          variant="bordered"
          className="bg-transparent hover:bg-primary-colour/5 py-4 border-primary-colour border-dashed w-full text-primary-colour"
          onPress={() => router.push("/new-story")}
        >
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            <span className={`text-base ${Magnetik_Medium.className}`}>
              Create a new story
            </span>
          </div>
        </Button>
      </div>
    </div>
  );

  // My Stories Preview Component (when user has stories but not in "see all" view)
  const MyStoriesPreview = () => (
    <div className="space-y-6">
      {/* Create New Story Button */}
      <div className="pt-8">
        <Button
          variant="bordered"
          className="bg-transparent hover:bg-complimentary-colour/5 border-2 border-complimentary-colour border-dashed w-full text-complimentary-colour"
          onPress={() => router.push("/new-story")}
        >
          <div className="flex items-center gap-2 my-4">
            <Plus className="w-5 h-5" />
            <span className={`text-base ${Magnetik_Regular.className}`}>
              Create a new story
            </span>
          </div>
        </Button>
      </div>

      {/* Library Button */}
      <div className="flex justify-end mt-2">
        <Button
          className={`bg-primary-shade-6 text-universal-white px-4 rounded-full text-[10px] ${Magnetik_Regular.className}`}
          size="sm"
          onPress={() => router.push("/library")}
        >
          <Library className="w-3 h-3" />
          Library
        </Button>
      </div>

      {/* My Stories Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className={`body-text-small-medium-auto text-primary-colour`}>
            My Stories
          </h2>
          <Button
            variant="light"
            className="p-0 h-auto body-text-smallest-medium-auto text-grey-2"
            onPress={() => {
              setShowAllStories(true);
              updatePenUrl(true, selectedTab);
            }}
          >
            See all
          </Button>
        </div>

        {/* Stories Grid - Show first 4 stories */}
        <div className="gap-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredStories
            .slice(0, 4)
            .map((story: ExtendedStory, idx: number) => (
              <StoryCard
                key={(story as ExtendedStory).id ?? idx}
                story={story as ExtendedStory}
                mode="pen"
                onEdit={handleEditStory}
                onDelete={handleDeleteStory}
                onClick={handleViewStory}
              />
            ))}
        </div>
      </div>
    </div>
  );

  // Full Stories List Component (when "See all" is clicked - with library-style underline tabs)
  const AllStoriesView = () => (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-6 border-light-grey-2 border-b overflow-x-auto no-scrollbar">
        {VALID_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => {
              setSelectedTab(tab);
              updatePenUrl(true, tab);
            }}
            className={`pb-3 text-sm relative whitespace-nowrap transition-colors ${
              selectedTab === tab
                ? `text-complimentary-colour ${Magnetik_Bold.className}`
                : `text-primary-shade-3 ${Magnetik_Regular.className}`
            }`}
          >
            {tab}
            {selectedTab === tab && (
              <div className="right-0 bottom-0 left-0 absolute bg-complimentary-colour rounded-full h-1" />
            )}
          </button>
        ))}
      </div>

      {/* Stories Grid */}
      {filteredStories.length > 0 ? (
        <div className="gap-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredStories.map((story: ExtendedStory, idx: number) => (
            <StoryCard
              key={(story as ExtendedStory).id ?? idx}
              story={story as ExtendedStory}
              mode="pen"
              onEdit={handleEditStory}
              onDelete={handleDeleteStory}
              onClick={handleViewStory}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col justify-center items-center py-12">
          <div className="flex justify-center items-center bg-light-grey-2 mb-4 rounded-full w-16 h-16">
            <BookOpen className="w-8 h-8 text-gray-400" />
          </div>
          <p
            className={`text-center text-gray-500 ${Magnetik_Regular.className}`}
          >
            No stories in {selectedTab.toLowerCase()} yet
          </p>
        </div>
      )}
    </div>
  );

  // Render appropriate view based on state — never flash EmptyState while loading
  if (isLoading && !hasStories) {
    return (
      <div className="space-y-4 mx-auto px-4 md:px-6 lg:px-8 pt-6 max-w-[28rem] md:max-w-3xl lg:max-w-5xl xl:max-w-6xl min-h-screen bg-accent-shade-1">
        <Skeleton className="rounded-xl w-full h-14" />
        <div className="gap-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="rounded-lg w-full h-48" />
          ))}
        </div>
      </div>
    );
  }

  if (!hasStories) {
    return <EmptyState />;
  }

  if (showAllStories) {
    return (
      <>
        <div className="mx-auto px-4 md:px-6 lg:px-8 pb-20 md:pb-6 max-w-[28rem] md:max-w-3xl lg:max-w-5xl xl:max-w-6xl min-h-screen bg-accent-shade-1">
          {/* Custom Header for All Stories View */}
          <div className="relative flex justify-center items-center mb-6 pt-4">
            <button
              onClick={() => {
                setShowAllStories(false);
                updatePenUrl(false);
              }}
              className="left-0 absolute text-primary-colour"
            >
              <ArrowLeft size={18} />
            </button>
            <h1 className="body-text-small-medium-auto text-primary-colour">
              My Stories
            </h1>
          </div>

          {/* Full Stories View with Tabs */}
          <AllStoriesView />
        </div>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={cancelDelete}
          classNames={{
            backdrop: "bg-black/50",
            closeButton: "hidden",
          }}
        >
          <ModalContent>
            <ModalHeader className="flex justify-between items-center px-6 pt-6 pb-4">
              <button onClick={cancelDelete} className="text-primary-colour">
                <ArrowLeft size={20} />
              </button>
              <h2 className="flex-1 body-text-small-medium-auto text-primary-colour text-center">
                Delete Story
              </h2>
              <button onClick={cancelDelete} className="text-primary-colour">
                <X size={20} />
              </button>
            </ModalHeader>

            <ModalBody className="px-6 py-8">
              <p className="body-text-small-medium-auto text-primary-colour text-center">
                Are you sure you want to delete &ldquo;{storyToDelete?.title}
                &rdquo;
              </p>
            </ModalBody>

            <ModalFooter className="flex gap-4 px-6 pt-0 pb-6">
              <Button
                onPress={cancelDelete}
                className="flex-1 bg-transparent py-6 border-2 border-primary-colour rounded-full body-text-small-medium-auto text-primary-colour"
              >
                No
              </Button>
              <Button
                onPress={confirmDelete}
                className="flex-1 bg-primary-shade-6 py-6 rounded-full body-text-small-medium-auto text-universal-white"
              >
                Yes
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    );
  }

  return (
    <>
      <div className="mx-auto px-4 md:px-6 lg:px-8 pb-20 md:pb-6 max-w-[28rem] md:max-w-3xl lg:max-w-5xl xl:max-w-6xl min-h-screen bg-accent-shade-1">
        {/* Main Content - My Stories Preview */}
        <MyStoriesPreview />
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={cancelDelete}
        placement="bottom"
        classNames={{
          backdrop: "bg-black/50",
          base: "bg-universal-white rounded-t-3xl m-0 mb-0 max-w-[28rem] md:max-w-xl mx-auto",
          closeButton: "hidden",
        }}
      >
        <ModalContent>
          <ModalHeader className="flex justify-between items-center px-6 pt-6 pb-4">
            <button onClick={cancelDelete} className="text-primary-colour">
              <ArrowLeft size={20} />
            </button>
            <h2 className="flex-1 body-text-small-medium-auto text-primary-colour text-center">
              Delete Story
            </h2>
            <button onClick={cancelDelete} className="text-primary-colour">
              <X size={20} />
            </button>
          </ModalHeader>

          <ModalBody className="px-6 py-8">
            <p className="body-text-small-medium-auto text-primary-colour text-center">
              Are you sure you want to delete &ldquo;{storyToDelete?.title}
              &rdquo;?
            </p>
            <p className="mt-4 font-medium text-red-600 text-sm text-center">
              This action cannot be undone.
            </p>
          </ModalBody>

          <ModalFooter className="flex gap-4 px-6 pt-0 pb-8">
            <Button
              onPress={confirmDelete}
              isLoading={isDeleting}
              isDisabled={!canDelete || isDeleting}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:opacity-50 py-7 rounded-full body-text-small-medium-auto text-white text-base"
            >
              {canDelete ? "Yes, Delete" : `Yes (${countdownDisplay})`}
            </Button>
            <Button
              onPress={cancelDelete}
              className="flex-1 bg-transparent py-7 border-2 border-primary-colour rounded-full body-text-small-medium-auto text-primary-colour text-base"
            >
              No
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default PenView;

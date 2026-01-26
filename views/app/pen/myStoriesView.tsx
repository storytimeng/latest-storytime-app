"use client";

import React, { useState, useMemo } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Tabs, Tab } from "@heroui/tabs";
import { Button } from "@heroui/button";
import { ArrowLeft, X, BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/reusables/customUI/pageHeader";
import { Magnetik_Bold, Magnetik_Medium, Magnetik_Regular } from "@/lib/font";
import { StoryCard } from "@/components/reusables/customUI";
import { useLibrary } from "@/src/hooks/useLibrary";
import { useDeleteStory } from "@/src/hooks/useStoryMutations";
import type { StoryResponseDto } from "@/src/client/types.gen";

// Locally extend StoryResponseDto for UI needs
type ExtendedStory = StoryResponseDto & {
  lastEdited?: string;
  writingDate?: string;
  updatedAt?: string;
  status?: string;
};

type TabKey = "Recent" | "Ongoing" | "Published" | "Drafts";

const MyStoriesView = () => {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<TabKey>("Recent");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [storyToDelete, setStoryToDelete] = useState<{
    id: string | number;
    title: string;
  } | null>(null);
  const deleteCountdown = React.useRef(5);
  const countdownInterval = React.useRef<NodeJS.Timeout | null>(null);
  const [canDelete, setCanDelete] = React.useState(false);
  const [countdownDisplay, setCountdownDisplay] = React.useState(5);

  // Fetch stories from user's library
  const { stories, isLoading, mutate } = useLibrary();

  // Delete story hook
  const { deleteStory, isDeleting } = useDeleteStory();

  // Filter stories by tab
  const filteredStories = useMemo(() => {
    if (!stories) return [];
    switch (selectedTab) {
      case "Recent":
        return [...stories].sort(
          (a, b) =>
            new Date(b.lastEdited || b.writingDate || b.updatedAt).getTime() -
            new Date(a.lastEdited || a.writingDate || a.updatedAt).getTime(),
        );
      case "Ongoing":
        return stories.filter(
          (story: ExtendedStory) => story.status === "Ongoing",
        );
      case "Published":
        return stories.filter(
          (story: ExtendedStory) => story.status === "Completed",
        );
      case "Drafts":
        return stories.filter(
          (story: ExtendedStory) => story.status === "Draft",
        );
      default:
        return stories;
    }
  }, [selectedTab, stories]);

  const handleEditStory = (storyId: string | number) => {
    router.push(`/edit-story/${storyId}`);
  };

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
  React.useEffect(() => {
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
    router.push(`/story/${storyId}`);
  };

  return (
    <>
      <div className="min-h-screen bg-accent-shade-1 max-w-[28rem] mx-auto px-4 pb-6">
        {/* Page Header */}
        <PageHeader
          title="My Stories"
          backLink="/pen"
          className="px-0 pt-5 pb-4"
          titleClassName="text-xl text-primary-colour font-bold"
        />

        {/* Tabs */}
        <div className="w-full mb-6">
          <Tabs
            selectedKey={selectedTab}
            onSelectionChange={(key: React.Key) =>
              setSelectedTab(key as TabKey)
            }
            variant="underlined"
            classNames={{
              tabList:
                "w-full relative rounded-none p-0 border-b border-divider",
              cursor: "w-full bg-complimentary-colour",
              tab: "max-w-fit px-0 h-12",
              tabContent: `group-data-[selected=true]:text-complimentary-colour ${Magnetik_Medium.className}`,
            }}
          >
            <Tab key="Recent" title="Recent" />
            <Tab key="Ongoing" title="Ongoing" />
            <Tab key="Published" title="Published" />
            <Tab key="Drafts" title="Drafts" />
          </Tabs>
        </div>

        {/* Stories Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <p className={`text-gray-500 ${Magnetik_Regular.className}`}>
              Loading stories...
            </p>
          </div>
        ) : filteredStories.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
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
          <div className="flex flex-col items-center justify-center py-12">
            <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-light-grey-2">
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

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={cancelDelete}
        placement="bottom"
        classNames={{
          backdrop: "bg-black/50",
          base: "bg-universal-white rounded-t-3xl m-0 mb-0 max-w-[28rem] mx-auto",
          closeButton: "hidden",
        }}
      >
        <ModalContent>
          <ModalHeader className="flex items-center justify-between px-6 pt-6 pb-4">
            <button onClick={cancelDelete} className="text-primary-colour">
              <ArrowLeft size={20} />
            </button>
            <h2 className="flex-1 text-center body-text-small-medium-auto text-primary-colour">
              Delete Story
            </h2>
            <button onClick={cancelDelete} className="text-primary-colour">
              <X size={20} />
            </button>
          </ModalHeader>

          <ModalBody className="px-6 py-8">
            <p className="text-center body-text-small-medium-auto text-primary-colour">
              Are you sure you want to delete &ldquo;{storyToDelete?.title}
              &rdquo;?
            </p>
            <p className="mt-4 text-center text-sm text-red-600 font-medium">
              This action cannot be undone.
            </p>
          </ModalBody>

          <ModalFooter className="flex gap-4 px-6 pt-0 pb-8">
            <Button
              onPress={confirmDelete}
              isLoading={isDeleting}
              isDisabled={!canDelete || isDeleting}
              className="flex-1 py-7 text-base rounded-full bg-red-600 hover:bg-red-700 text-white body-text-small-medium-auto disabled:opacity-50 disabled:bg-red-400"
            >
              {canDelete ? "Yes, Delete" : `Yes (${countdownDisplay})`}
            </Button>
            <Button
              onPress={cancelDelete}
              className="flex-1 py-7 text-base bg-transparent border-2 rounded-full border-primary-colour text-primary-colour body-text-small-medium-auto"
            >
              No
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default MyStoriesView;

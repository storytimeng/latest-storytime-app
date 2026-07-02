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
import { useRouter } from "next/navigation";
import { rewriteForCapacitor } from "@/lib/linkRewrite";

import { useUserProfile } from "@/src/hooks/useUserProfile";
import { useLibrary } from "@/src/hooks/useLibrary";
import { useDeleteStory, useRequestStoryDeletion } from "@/src/hooks/useStoryMutations";
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

const PenView = () => {
  const router = useRouter();

  useEffect(() => {
    router.prefetch("/");
    router.prefetch("/library");
    router.prefetch("/new-story");
  }, [router]);

  const [selectedTab, setSelectedTab] = useState<TabKey>("Recent");
  const [showAllStories, setShowAllStories] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestReason, setRequestReason] = useState("");
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

  // Delete story hooks
  const { deleteStory, isDeleting } = useDeleteStory();
  const { requestDeletion, isRequesting } = useRequestStoryDeletion();

  // Filter stories by tab
  // Backend returns storyStatus: "complete" | "ongoing" | "drafts"
  const filteredStories = useMemo(() => {
    if (!stories) return [];
    switch (selectedTab) {
      case "Recent":
        return [...stories].sort(
          (a, b) =>
            new Date((b as any).updatedAt || (b as any).createdAt || 0).getTime() -
            new Date((a as any).updatedAt || (a as any).createdAt || 0).getTime(),
        );
      case "Ongoing":
        return stories.filter(
          (story: ExtendedStory) => (story as any).storyStatus === "ongoing",
        );
      case "Published":
        return stories.filter(
          (story: ExtendedStory) => (story as any).storyStatus === "complete",
        );
      case "Drafts":
        return stories.filter(
          (story: ExtendedStory) => (story as any).storyStatus === "drafts",
        );
      default:
        return stories;
    }
  }, [selectedTab, stories]);

  const hasStories = filteredStories.length > 0;

  const handleEditStory = (storyId: string | number) => {
    router.push(rewriteForCapacitor(`/edit-story/${storyId}`));
  };

  // Route to direct delete (drafts) or deletion request (published/ongoing)
  const handleDeleteStory = (storyId: string | number) => {
    const story = filteredStories.find((s: ExtendedStory) => s.id === storyId);
    if (!story) return;
    setStoryToDelete({ id: storyId, title: (story as ExtendedStory).title });

    const isDraft = (story as any).storyStatus === "drafts";
    if (isDraft) {
      deleteCountdown.current = 5;
      setCountdownDisplay(5);
      setCanDelete(false);
      setIsDeleteModalOpen(true);
    } else {
      setRequestReason("");
      setIsRequestModalOpen(true);
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

  const confirmRequestDeletion = async () => {
    if (!storyToDelete) return;
    const success = await requestDeletion(String(storyToDelete.id), requestReason || undefined);
    if (success) mutate();
    setIsRequestModalOpen(false);
    setStoryToDelete(null);
    setRequestReason("");
  };

  const cancelRequest = () => {
    setIsRequestModalOpen(false);
    setStoryToDelete(null);
    setRequestReason("");
  };

  const handleViewStory = (storyId: string | number) => {
    router.push(rewriteForCapacitor(`/story/${storyId}`));
  };

  // Empty State Component (when user has no stories at all)
  const EmptyState = () => (
    <div className="min-h-screen bg-accent-shade-1 max-w-[28rem] md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto relative">
      {/* Library Button */}
      <div className="absolute z-10 top-4 right-4">
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
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        {/* Illustration */}
        <div className="flex items-center justify-center w-32 h-32 mb-8 bg-complimentary-colour/10 rounded-2xl">
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
          className="w-full py-4 bg-transparent border-dashed border-primary-colour text-primary-colour hover:bg-primary-colour/5"
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
          className="w-full bg-transparent border-2 border-dashed border-complimentary-colour text-complimentary-colour hover:bg-complimentary-colour/5"
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
        <div className="flex items-center justify-between">
          <h2 className={`body-text-small-medium-auto text-primary-colour`}>
            My Stories
          </h2>
          <Button
            variant="light"
            className="h-auto p-0 text-grey-2 body-text-smallest-medium-auto"
            onPress={() => setShowAllStories(true)}
          >
            See all
          </Button>
        </div>

        {/* Stories Grid - Show first 4 stories */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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

  // Full Stories List Component (when "See all" is clicked - with tabs)
  const AllStoriesView = () => (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="w-full">
        <Tabs
          selectedKey={selectedTab}
          onSelectionChange={(key: React.Key) => setSelectedTab(key as TabKey)}
          variant="underlined"
          classNames={{
            tabList: "w-full relative rounded-none p-0 border-b border-divider",
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
      {filteredStories.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
  );

  // Render appropriate view based on state
  if (!hasStories) {
    return <EmptyState />;
  }

  if (showAllStories) {
    return (
      <>
        <div className="min-h-screen bg-accent-shade-1 max-w-[28rem] md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto px-4 md:px-6 lg:px-8 pb-20 md:pb-6">
          {/* Custom Header for All Stories View */}
          <div className="relative flex items-center justify-center pt-4 mb-6">
            <button
              onClick={() => setShowAllStories(false)}
              className="absolute left-0 text-primary-colour"
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
                &rdquo;
              </p>
            </ModalBody>

            <ModalFooter className="flex gap-4 px-6 pt-0 pb-6">
              <Button
                onPress={cancelDelete}
                className="flex-1 py-6 bg-transparent border-2 rounded-full border-primary-colour text-primary-colour body-text-small-medium-auto"
              >
                No
              </Button>
              <Button
                onPress={confirmDelete}
                isLoading={isDeleting}
                isDisabled={!canDelete || isDeleting}
                className="flex-1 py-6 rounded-full bg-primary-shade-6 text-universal-white body-text-small-medium-auto"
              >
                {canDelete ? "Yes, Delete" : `Yes (${countdownDisplay})`}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Deletion Request Modal (published/ongoing stories) */}
        <Modal
          isOpen={isRequestModalOpen}
          onClose={cancelRequest}
          classNames={{
            backdrop: "bg-black/50",
            closeButton: "hidden",
          }}
        >
          <ModalContent>
            <ModalHeader className="flex items-center justify-between px-6 pt-6 pb-4">
              <button onClick={cancelRequest} className="text-primary-colour">
                <ArrowLeft size={20} />
              </button>
              <h2 className="flex-1 text-center body-text-small-medium-auto text-primary-colour">
                Request Story Removal
              </h2>
              <button onClick={cancelRequest} className="text-primary-colour">
                <X size={20} />
              </button>
            </ModalHeader>
            <ModalBody className="px-6 py-4">
              <p className="text-center body-text-small-medium-auto text-primary-colour">
                &ldquo;{storyToDelete?.title}&rdquo; is published. Our team will review your request and remove it shortly.
              </p>
              <textarea
                className="mt-4 w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-primary-colour resize-none focus:outline-none focus:ring-2 focus:ring-primary-colour"
                rows={3}
                placeholder="Reason for removal (optional)"
                value={requestReason}
                onChange={(e) => setRequestReason(e.target.value)}
              />
            </ModalBody>
            <ModalFooter className="flex gap-4 px-6 pt-0 pb-6">
              <Button
                onPress={confirmRequestDeletion}
                isLoading={isRequesting}
                isDisabled={isRequesting}
                className="flex-1 py-6 rounded-full bg-primary-colour text-white body-text-small-medium-auto"
              >
                Submit Request
              </Button>
              <Button
                onPress={cancelRequest}
                className="flex-1 py-6 bg-transparent border-2 rounded-full border-primary-colour text-primary-colour body-text-small-medium-auto"
              >
                Cancel
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-accent-shade-1 max-w-[28rem] md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto px-4 md:px-6 lg:px-8 pb-20 md:pb-6">
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

      {/* Deletion Request Modal (for published/ongoing stories) */}
      <Modal
        isOpen={isRequestModalOpen}
        onClose={cancelRequest}
        placement="bottom"
        classNames={{
          backdrop: "bg-black/50",
          base: "bg-universal-white rounded-t-3xl m-0 mb-0 max-w-[28rem] md:max-w-xl mx-auto",
          closeButton: "hidden",
        }}
      >
        <ModalContent>
          <ModalHeader className="flex items-center justify-between px-6 pt-6 pb-4">
            <button onClick={cancelRequest} className="text-primary-colour">
              <ArrowLeft size={20} />
            </button>
            <h2 className="flex-1 text-center body-text-small-medium-auto text-primary-colour">
              Request Story Removal
            </h2>
            <button onClick={cancelRequest} className="text-primary-colour">
              <X size={20} />
            </button>
          </ModalHeader>

          <ModalBody className="px-6 py-4">
            <p className="text-center body-text-small-medium-auto text-primary-colour">
              &ldquo;{storyToDelete?.title}&rdquo; is published. Our team will review your request and remove it shortly.
            </p>
            <textarea
              className="mt-4 w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-primary-colour resize-none focus:outline-none focus:ring-2 focus:ring-primary-colour"
              rows={3}
              placeholder="Reason for removal (optional)"
              value={requestReason}
              onChange={(e) => setRequestReason(e.target.value)}
            />
          </ModalBody>

          <ModalFooter className="flex gap-4 px-6 pt-0 pb-8">
            <Button
              onPress={confirmRequestDeletion}
              isLoading={isRequesting}
              isDisabled={isRequesting}
              className="flex-1 py-7 text-base rounded-full bg-primary-colour text-white body-text-small-medium-auto"
            >
              Submit Request
            </Button>
            <Button
              onPress={cancelRequest}
              className="flex-1 py-7 text-base bg-transparent border-2 rounded-full border-primary-colour text-primary-colour body-text-small-medium-auto"
            >
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default PenView;

"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Tabs, Tab } from "@heroui/tabs";
import { Button } from "@heroui/button";
import { BookOpen, PenLine, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Magnetik_Bold, Magnetik_Medium, Magnetik_Regular } from "@/lib/font";
import { StoryCard } from "@/components/reusables/customUI";
import { useLibrary } from "@/src/hooks/useLibrary";
import { useDeleteStory } from "@/src/hooks/useStoryMutations";
import { DESKTOP_ROUTES } from "@/config/desktopRoutes";
import { getStoryRoutes } from "@/lib/storyRoutes";
import type { StoryResponseDto } from "@/src/client/types.gen";

type ExtendedStory = StoryResponseDto & {
  lastEdited?: string;
  writingDate?: string;
  updatedAt?: string;
  status?: string;
};

type TabKey = "Recent" | "Ongoing" | "Published" | "Drafts";

const GRID_CLASS =
  "grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";

export function DesktopMyStoriesView() {
  const router = useRouter();
  const routes = getStoryRoutes("desktop");
  const [selectedTab, setSelectedTab] = useState<TabKey>("Recent");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [storyToDelete, setStoryToDelete] = useState<{
    id: string | number;
    title: string;
  } | null>(null);
  const deleteCountdown = useRef(5);
  const countdownInterval = useRef<NodeJS.Timeout | null>(null);
  const [canDelete, setCanDelete] = useState(false);
  const [countdownDisplay, setCountdownDisplay] = useState(5);

  const { stories, isLoading, mutate } = useLibrary();
  const { deleteStory, isDeleting } = useDeleteStory();

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
    router.push(routes.editStory(String(storyId)));
  };

  const handleDeleteStory = (storyId: string | number) => {
    const story = filteredStories.find((s: ExtendedStory) => s.id === storyId);
    if (story) {
      setStoryToDelete({ id: storyId, title: story.title });
      deleteCountdown.current = 5;
      setCountdownDisplay(5);
      setCanDelete(false);
      setIsDeleteModalOpen(true);
    }
  };

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
        mutate();
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
    router.push(routes.story(String(storyId)));
  };

  return (
    <>
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2
              className={cn("text-2xl text-[#361B17]", Magnetik_Bold.className)}
            >
              My stories
            </h2>
            <p
              className={cn(
                "mt-1 text-sm text-[#361B17]/60",
                Magnetik_Regular.className,
              )}
            >
              Manage drafts, published work, and stories in progress.
            </p>
          </div>

          <Link
            href={DESKTOP_ROUTES.newStory}
            className={cn(
              "inline-flex items-center gap-2 rounded-full bg-primary-colour px-4 py-2.5 text-sm text-white transition-opacity hover:opacity-90",
              Magnetik_Medium.className,
            )}
          >
            <Plus className="h-4 w-4" />
            New story
          </Link>
        </div>

        <Tabs
          selectedKey={selectedTab}
          onSelectionChange={(key: React.Key) => setSelectedTab(key as TabKey)}
          variant="underlined"
          classNames={{
            tabList: "mb-6 w-full border-b border-black/10 p-0",
            cursor: "bg-primary-colour",
            tab: "h-11 max-w-fit px-0",
            tabContent: cn(
              "group-data-[selected=true]:text-primary-colour",
              Magnetik_Medium.className,
            ),
          }}
        >
          <Tab key="Recent" title="Recent" />
          <Tab key="Ongoing" title="Ongoing" />
          <Tab key="Published" title="Published" />
          <Tab key="Drafts" title="Drafts" />
        </Tabs>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <p className={cn("text-[#361B17]/60", Magnetik_Regular.className)}>
              Loading stories…
            </p>
          </div>
        ) : filteredStories.length > 0 ? (
          <div className={GRID_CLASS}>
            {filteredStories.map((story: ExtendedStory, idx: number) => (
              <StoryCard
                key={story.id ?? idx}
                story={story}
                mode="pen"
                className="w-full"
                onEdit={handleEditStory}
                onDelete={handleDeleteStory}
                onClick={handleViewStory}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-black/15 bg-white/50 py-16">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-black/[0.04]">
              <BookOpen className="h-8 w-8 text-[#361B17]/35" />
            </div>
            <p
              className={cn(
                "text-center text-[#361B17]/60",
                Magnetik_Regular.className,
              )}
            >
              No stories in {selectedTab.toLowerCase()} yet.
            </p>
            <Link
              href={DESKTOP_ROUTES.newStory}
              className={cn(
                "mt-4 inline-flex items-center gap-2 text-sm text-primary-colour hover:underline",
                Magnetik_Medium.className,
              )}
            >
              <PenLine className="h-4 w-4" />
              Start writing
            </Link>
          </div>
        )}
      </div>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={cancelDelete}
        placement="center"
        classNames={{
          backdrop: "bg-black/50",
          base: "mx-4 max-w-md rounded-2xl bg-white",
        }}
      >
        <ModalContent>
          <ModalHeader
            className={cn("text-primary-colour", Magnetik_Bold.className)}
          >
            Delete story
          </ModalHeader>
          <ModalBody>
            <p
              className={cn(
                "text-sm text-[#361B17]/80",
                Magnetik_Regular.className,
              )}
            >
              Are you sure you want to delete &ldquo;{storyToDelete?.title}
              &rdquo;? This action cannot be undone.
            </p>
          </ModalBody>
          <ModalFooter className="gap-3">
            <Button variant="light" onPress={cancelDelete}>
              Cancel
            </Button>
            <Button
              color="danger"
              onPress={confirmDelete}
              isLoading={isDeleting}
              isDisabled={!canDelete || isDeleting}
            >
              {canDelete ? "Delete" : `Delete (${countdownDisplay})`}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

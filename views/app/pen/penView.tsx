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
// Temporary mock data - replace with actual data fetching
const mockStories = [
  {
    id: "1",
    title: "The Enchanted Forest",
    status: "Ongoing",
    genre: "Fantasy",
    writingDate: "12-02-2024",
    image: "/images/nature.jpg",
    lastEdited: "2024-01-20",
  },
  {
    id: "2",
    title: "Mystery of the Lost City",
    status: "Draft",
    genre: "Adventure",
    writingDate: "12-02-2024",
    image: "/images/nature.jpg",
    lastEdited: "2024-01-18",
  },
  {
    id: "3",
    title: "Love in the Time of War",
    status: "Completed",
    genre: "Romance",
    writingDate: "12-02-2024",
    image: "/images/nature.jpg",
    lastEdited: "2024-01-15",
  },
  {
    id: "4",
    title: "The Lost Ship",
    status: "Ongoing",
    genre: "Adventure",
    writingDate: "12-02-2024",
    image: "/images/nature.jpg",
    lastEdited: "2024-01-22",
  },
];

type TabKey = "Recent" | "Ongoing" | "Published" | "Drafts";

const PenView = () => {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<TabKey>("Recent");
  const [showAllStories, setShowAllStories] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [storyToDelete, setStoryToDelete] = useState<{
    id: string | number;
    title: string;
  } | null>(null);

  // Check if user has any stories
  const hasStories = mockStories.length > 0; // Filter stories based on selected tab
  const filteredStories = useMemo(() => {
    switch (selectedTab) {
      case "Recent":
        return [...mockStories].sort(
          (a, b) =>
            new Date(b.lastEdited || b.writingDate).getTime() -
            new Date(a.lastEdited || a.writingDate).getTime()
        );
      case "Ongoing":
        return mockStories.filter((story) => story.status === "Ongoing");
      case "Published":
        return mockStories.filter((story) => story.status === "Completed");
      case "Drafts":
        return mockStories.filter((story) => story.status === "Draft");
      default:
        return mockStories;
    }
  }, [selectedTab]);

  const handleEditStory = (storyId: string | number) => {
    router.push(`/edit-story/${storyId}`);
  };

  const handleDeleteStory = (storyId: string | number) => {
    // Find the story title
    const story = mockStories.find((s) => s.id === storyId);
    if (story) {
      setStoryToDelete({ id: storyId, title: story.title });
      setIsDeleteModalOpen(true);
    }
  };

  const confirmDelete = () => {
    if (storyToDelete) {
      // TODO: Implement actual delete functionality
      // For now, just close the modal
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

  // Empty State Component (when user has no stories at all)
  const EmptyState = () => (
    <div className="min-h-screen bg-accent-shade-1 max-w-[28rem] mx-auto relative">
      {/* Library Button */}
      <div className="absolute z-10 top-4 right-4">
        <Button
          className={`bg-primary-shade-6 text-universal-white px-4 rounded-full text-[10px] ${Magnetik_Regular.className}`}
          size="sm"
          onPress={() => router.push("/app/library")}
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
          onPress={() => router.push("/app/library")}
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
        <div className="grid grid-cols-2 gap-4">
          {mockStories.slice(0, 4).map((story) => (
            <StoryCard
              key={story.id}
              story={story}
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
        <div className="grid grid-cols-2 gap-4">
          {filteredStories.map((story) => (
            <StoryCard
              key={story.id}
              story={story}
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
        <div className="min-h-screen bg-accent-shade-1 max-w-[28rem] mx-auto px-4 pb-6">
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
                className="flex-1 py-6 rounded-full bg-primary-shade-6 text-universal-white body-text-small-medium-auto"
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
      <div className="min-h-screen bg-accent-shade-1 max-w-[28rem] mx-auto px-4 pb-6">
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
              className="flex-1 py-6 rounded-full bg-primary-shade-6 text-universal-white body-text-small-medium-auto"
            >
              Yes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default PenView;

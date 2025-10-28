"use client";

import React from "react";
import { useParams } from "next/navigation";
import StoryView from "@/components/reusables/storyView";

const EditStoryView = () => {
  const params = useParams();
  const storyId = params.id as string;

  return <StoryView mode="edit" storyId={storyId} />;
};

export default EditStoryView;

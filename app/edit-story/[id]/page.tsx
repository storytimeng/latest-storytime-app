"use client";

import { useParams } from "next/navigation";
import { EditStoryView } from "@/views";

const EditStoryPage = () => {
  const params = useParams();
  const id = params.id as string;

  return <EditStoryView />;
};

export default EditStoryPage;

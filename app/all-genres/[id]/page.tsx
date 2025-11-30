import { GenresView } from "@/views";
import React from "react";

const GenrePage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  return <GenresView />;
};

export default GenrePage;

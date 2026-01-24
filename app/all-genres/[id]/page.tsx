import { CategoryView } from "@/views";
import React from "react";

const GenrePage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  return <CategoryView categorySlug={id} type="genre" />;
};

export default GenrePage;

import { CategoryView } from "@/views";
import React from "react";

const CategoryPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  return <CategoryView category={slug} />;
};

export default CategoryPage;

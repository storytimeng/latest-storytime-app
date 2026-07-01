"use client";

import { useSearchParams } from "next/navigation";
import { EditStoryView } from "@/views";

/**
 * Client wrapper that resolves the story id from the query string and
 * hands it off to the universal `EditStoryView` (which itself reads
 * from `useParams().id` OR `useSearchParams().get("id")`).
 */
export default function EditStoryClient() {
  // Trigger the hook so Suspense can pick it up; the value is read
  // inside EditStoryView, which uses both useParams and useSearchParams.
  useSearchParams();
  return <EditStoryView />;
}

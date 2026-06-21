import { DesktopPlaceholderView } from "@/views/desktop";

export default function DesktopLibraryPage() {
  return (
    <DesktopPlaceholderView
      title="Library"
      phase="Phase 2 · Core tabs"
      description="Desktop library will show filters in a sidebar and your saved stories in a grid. Mobile library at /library is unchanged."
      mobilePath="/library"
    />
  );
}

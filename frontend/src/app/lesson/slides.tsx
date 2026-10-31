import { SlideViewer } from "@/components/SlideViewer";
import { EmptyState } from "@/components/EmptyState";
import { useLocalSearchParams } from "expo-router";

export default function SlidesScreen() {
  const params = useLocalSearchParams();
  const start = params.start ? Number(params.start) : undefined;
  const variant = (params.variant as string) ?? "vocab";
  const empty = params.empty === "1";

  if (empty) {
    return (
      <EmptyState
        title="Lesson not uploaded yet"
        description="Your teacher hasn't uploaded this lesson's resources. Check back later."
      />
    );
  }

  return <SlideViewer variant={variant as any} initialSlide={start} />;
}

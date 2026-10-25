import { SlideViewer } from "@/components/SlideViewer";
import { useLocalSearchParams } from "expo-router";

export default function SlidesScreen() {
  const params = useLocalSearchParams();
  const start = params.start ? Number(params.start) : undefined;
  return <SlideViewer variant="vocab" initialSlide={start} />;
}
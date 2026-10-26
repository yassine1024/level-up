import { SlideViewer } from "@/components/SlideViewer";
import { useLocalSearchParams } from "expo-router";

export default function GrammarSlidesScreen() {
  const params = useLocalSearchParams();
  const start = params.start ? Number(params.start) : undefined;
  return <SlideViewer variant="grammar" initialSlide={start} />;
}
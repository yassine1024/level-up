import { useQuery } from "@tanstack/react-query";

import { studentApi } from "@/src/api/endpoints";

export function useCourse() {
  return useQuery({
    queryKey: ["student", "course"],
    queryFn: () => studentApi.getCourse(),
  });
}
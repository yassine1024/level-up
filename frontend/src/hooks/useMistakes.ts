import { useQuery } from "@tanstack/react-query";
import { studentApi } from "@/src/api/endpoints";

export function useMistakes() {
  return useQuery({
    queryKey: ["student", "mistakes"],
    queryFn: () => studentApi.getMistakes(),
  });
}

import { useQuery } from "@tanstack/react-query";
import { userApi } from "@/src/api/endpoints";

export function useMe(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => userApi.getMe(),
    enabled: options?.enabled,
  });
}

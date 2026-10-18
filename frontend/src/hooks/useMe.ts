import { useQuery } from "@tanstack/react-query";
import { userApi } from "@/src/api/endpoints";

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => userApi.getMe(),
  });
}
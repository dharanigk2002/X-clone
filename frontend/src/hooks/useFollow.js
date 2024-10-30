import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { fetchAPI } from "../utils/fetchAPI";

export function useFollow() {
  const queryClient = useQueryClient();
  const { mutate: follow, isPending } = useMutation({
    mutationFn: (userId) =>
      fetchAPI({
        path: `api/user/follow/${userId}`,
      }),
    onSuccess: () => {
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["suggestedUsers"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["authUser"],
        }),
      ]);
    },
    onError: (err) => {
      console.log(err);
      toast.error(err.message);
    },
  });
  return [follow, isPending];
}

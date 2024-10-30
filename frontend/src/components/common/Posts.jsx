import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { fetchAPI } from "../../utils/fetchAPI";

const Posts = ({ feedType, username, userId }) => {
  function getPostEndPoint() {
    switch (feedType) {
      case "forYou":
        return "api/posts/all";
      case "following":
        return "api/posts/following";
      case "posts":
        return `api/posts/user/${username}`;
      case "likes":
        return `api/posts/likes/${userId}`;
      default:
        return "api/posts/all";
    }
  }

  const POST_URL = getPostEndPoint();
  const {
    data: POSTS,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["posts"],
    queryFn: () =>
      fetchAPI({
        path: POST_URL,
      }),
  });

  useEffect(() => {
    refetch();
  }, [feedType, refetch, username]);

  return (
    <>
      {(isLoading || isRefetching) && (
        <div className="flex flex-col justify-center">
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </div>
      )}
      {!isLoading && POSTS?.posts.length === 0 && (
        <p className="text-center my-4">No posts in this tab. Switch 👻</p>
      )}
      {!isLoading && POSTS && (
        <div>
          {POSTS.posts.map((post) => (
            <Post key={post._id} post={post} />
          ))}
        </div>
      )}
    </>
  );
};
export default Posts;

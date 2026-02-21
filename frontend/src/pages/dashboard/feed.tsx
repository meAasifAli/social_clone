import { useState, useEffect, useRef, useCallback } from "react";
import { PostCard } from "@/components/feed/post-card";
import { type Post, useGetFeedQuery } from "@/store/apis/post-api";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

// Modern Skeleton Loader Component
const PostCardSkeleton = () => {
  return (
    <div className="border bg-background shadow-sm rounded-lg overflow-hidden">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-full" />
          <div className="flex flex-col gap-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>

      {/* Image Skeleton */}
      <Skeleton className="w-full h-80" />

      {/* Content Skeleton */}
      <div className="px-4 py-3 space-y-3">
        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          <Skeleton className="h-4 w-20" />
        </div>

        {/* Likes */}
        <Skeleton className="h-4 w-16" />

        {/* Caption */}
        <div className="space-y-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    </div>
  );
};

// Loading Feed Component
const LoadingFeed = () => {
  return (
    <div className="flex flex-col gap-6">
      {[...Array(3)].map((_, index) => (
        <PostCardSkeleton key={index} />
      ))}
    </div>
  );
};

const Feed = () => {
  const [page, setPage] = useState(1);
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const limit = 5; // Posts per page

  const { data, isLoading, isError, isFetching } = useGetFeedQuery({
    limit,
    offset: (page - 1) * limit,
  });

  // Accumulate posts when new data arrives
  useEffect(() => {
    if (data?.data) {
      setAllPosts((prev) => {
        // Only append new posts that aren't already in the list
        const existingIds = new Set(prev.map(p => p.id));
        const newPosts = data.data.filter(p => !existingIds.has(p.id));
        return [...prev, ...newPosts];
      });
    }
  }, [data]);

  const hasMore = data?.data?.length === limit;
  const isFetchingMore = isFetching && page > 1;

  // Intersection Observer for infinite scroll
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastPostRef = useCallback(
    (node: HTMLDivElement) => {
      if (isLoading || isFetching) return;

      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetching) {
          setPage((prevPage) => prevPage + 1);
        }
      });

      if (node) {
        observerRef.current.observe(node);
      }
    },
    [isLoading, hasMore, isFetching],
  );

  // Reset page when component unmounts or query changes
  useEffect(() => {
    return () => {
      setPage(1);
    };
  }, []);

  // Handle load more button click
  const handleLoadMore = () => {
    if (hasMore && !isFetching) {
      setPage((prev) => prev + 1);
    }
  };

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-red-500 mb-4">Failed to load feed</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Initial Loading */}
      {isLoading && page === 1 ? (
        <LoadingFeed />
      ) : (
        <>
          {/* Posts */}
          {allPosts.map((post, index) => {
            if (allPosts.length === index + 1) {
              // Last post - attach ref for intersection observer
              return (
                <div ref={lastPostRef} key={post.id}>
                  <PostCard post={post} />
                </div>
              );
            } else {
              return <PostCard key={post.id} post={post} />;
            }
          })}

          {/* Loading more indicator */}
          {isFetchingMore && (
            <div className="flex justify-center py-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm">Loading more posts...</span>
              </div>
            </div>
          )}

          {/* End of feed message */}
          {!hasMore && allPosts.length > 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">
                You've reached the end! 🎉
              </p>
            </div>
          )}

          {/* Load More Button (fallback for browsers without Intersection Observer) */}
          {hasMore && !isFetching && allPosts.length > 0 && (
            <div className="flex justify-center py-4">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                className="w-full max-w-xs"
              >
                Load more
              </Button>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && allPosts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No posts yet</p>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Refresh
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Feed;

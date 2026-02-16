import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchPostsQuery } from "@/store/apis/post-api";
import { useNavigate } from "react-router-dom";

const Search = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 500);
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useSearchPostsQuery({
    q: debouncedQuery,
    page,
    limit: 20,
  });

  // Log the actual data structure to see what you're getting
  useEffect(() => {
    if (data) {
      console.log("📦 Received data:", data);
      console.log("📦 First post sample:", data.data?.[0]);
    }
  }, [data]);

  const handlePostClick = (postId: string) => {
    navigate(`/dashboard/post/${postId}`);
  };

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <Input
        placeholder="Search posts or users..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full"
      />

      {/* Show current query for debugging */}
      <div className="text-xs text-muted-foreground">
        Found: {data?.total || 0} results | Page: {page}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="aspect-square w-full rounded-lg" />
          ))}
        </div>
      )}

      {/* Results Grid */}
      {!isLoading && data?.data && data.data.length > 0 && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {data.data.map((post) => (
              <Card
                key={post.id}
                className="group relative cursor-pointer overflow-hidden"
                onClick={() => handlePostClick(post.id)}
              >
                {/* Container with background color that wraps the image */}
                <div
                  className="aspect-square w-full flex items-center justify-center"
                  style={{
                    backgroundColor: post.backgroundColor || "#f3f4f6",
                  }}
                >
                  {post.image ? (
                    <img
                      src={post.image}
                      alt="post"
                      className="w-full h-full object-cover transition group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center p-4">
                      <p className="text-xs text-center line-clamp-3 text-foreground">
                        {post.content}
                      </p>
                    </div>
                  )}
                </div>

                {/* Hover overlay - same for both image and text posts */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center text-white text-sm p-2">
                  <p className="font-semibold">
                    @
                    {post.author?.username ||
                      post.author?.email?.split("@")[0] ||
                      "user"}
                  </p>
                  <p className="text-xs mt-1">{post.likeCount || 0} likes</p>
                </div>
              </Card>
            ))}
          </div>

          {/* Load More */}
          {data.data.length === 20 && (
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={isFetching}
              className="w-full py-3 text-sm text-muted-foreground hover:text-foreground transition"
            >
              {isFetching ? "Loading..." : "Load more"}
            </button>
          )}
        </>
      )}

      {/* Empty state */}
      {!isLoading &&
        debouncedQuery &&
        (!data?.data || data.data.length === 0) && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No results found for "{debouncedQuery}"
            </p>
          </div>
        )}

      {/* Initial state */}
      {!isLoading && !data?.data && !debouncedQuery && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Start typing to search posts and users
          </p>
        </div>
      )}
    </div>
  );
};

export default Search;

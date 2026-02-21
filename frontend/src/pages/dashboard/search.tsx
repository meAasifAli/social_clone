import { useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useSearchPostsQuery } from "@/store/apis/post-api";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, SearchIcon } from "lucide-react";

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



  const handlePostClick = (postId: string) => {
    navigate(`/dashboard/post/${postId}`);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Area */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Explore</h1>
        <p className="text-muted-foreground text-sm">Discover new posts, thoughts, and creators.</p>
      </div>

      {/* Search Input */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
          <SearchIcon className="h-5 w-5" />
        </div>
        <Input
          placeholder="Search posts or users..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-12 py-6 rounded-2xl bg-muted/50 border-transparent hover:bg-muted focus-visible:bg-background shadow-sm text-base transition-all"
        />
      </div>


      {/* Show current query for debugging */}
      {debouncedQuery && (
        <div className="text-sm text-muted-foreground flex items-center justify-between">
          <span>Results for <strong>"{debouncedQuery}"</strong></span>
          <span>Found {data?.total || 0} items</span>
        </div>
      )}

      {/* Results Grid */}
      {!isLoading && data?.data && data.data.length > 0 && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {data.data.map((post) => (
              <Card
                key={post.id}
                className="group relative cursor-pointer overflow-hidden border-0 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300"
                onClick={() => handlePostClick(post.id)}
              >
                {/* Container with background color that wraps the image */}
                <div
                  className="aspect-[4/5] w-full flex items-center justify-center relative"
                  style={{
                    background: post.image 
                      ? "#111" 
                      : (post.backgroundColor || 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)'), 
                  }}
                >
                  {post.image ? (
                    <img
                      src={post.image}
                      alt="post"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center p-6 text-center">
                      <p className={cn(
                        "text-lg md:text-xl font-semibold line-clamp-6 leading-snug tracking-tight",
                        post.backgroundColor ? "text-white" : "text-foreground/90"
                      )}>
                        {post.content}
                      </p>
                    </div>
                  )}

                  {/* Gradient Overlay for Text Posts without background colors */}
                  {!post.image && !post.backgroundColor && (
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />
                  )}
                </div>

                {/* Hover overlay - beautiful gradient */}
                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 md:p-5">
                  <div className="flex flex-col gap-3 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-white drop-shadow-md text-sm line-clamp-2 md:line-clamp-3 leading-snug opacity-90">
                      {post.content}
                    </p>
                    <div className="flex items-center justify-between text-white mt-1">
                      <div className="flex items-center gap-2">
                         <Avatar className="h-6 w-6 border border-white/20 shadow-sm">
                           <AvatarImage src={post.author?.profile?.avatar} />
                           <AvatarFallback className="text-[10px] bg-white/20 text-white backdrop-blur-sm">
                             {post.author?.username?.charAt(0).toUpperCase()}
                           </AvatarFallback>
                         </Avatar>
                        <p className="font-semibold text-sm truncate max-w-[100px] md:max-w-[120px] drop-shadow-md">
                          {post.author?.username || post.author?.email?.split("@")[0] || "user"}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 text-sm font-semibold opacity-90 drop-shadow-md">
                        <div className="flex items-center gap-1">
                          <Heart className="h-4 w-4" />
                          <span>{post.likeCount || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4" />
                          <span>{post.commentCount || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
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

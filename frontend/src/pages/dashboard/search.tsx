"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { demoPosts } from "@/data";

const Search = () => {
  const [query, setQuery] = useState("");

  const filteredPosts = useMemo(() => {
    if (!query.trim()) return demoPosts;

    return demoPosts.filter(
      (post) =>
        post.caption.toLowerCase().includes(query.toLowerCase()) ||
        post.user.username.toLowerCase().includes(query.toLowerCase())
    );
  }, [query]);

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <Input
        placeholder="Search posts or users"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {/* Posts Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {filteredPosts.map((post) => (
          <Card
            key={post.id}
            className="group relative cursor-pointer overflow-hidden"
          >
            <img
              src={post.image}
              alt="post"
              className="aspect-square w-full object-cover transition group-hover:scale-105"
            />

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-sm font-medium">
              @{post.user.username}
            </div>
          </Card>
        ))}
      </div>

      {/* Empty state */}
      {filteredPosts.length === 0 && (
        <p className="text-sm text-muted-foreground text-center">
          No posts found
        </p>
      )}
    </div>
  );
};

export default Search;

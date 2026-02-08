import { PostCard } from "@/components/feed/post-card";
import { demoPosts } from "@/data";

const Feed = () => {
  return (
    <div className="flex flex-col gap-6">
      {demoPosts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
};

export default Feed;

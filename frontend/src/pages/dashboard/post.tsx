import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Heart,
  MessageCircle,
  Send,
  MoreHorizontal,
  Trash2,
  Link2,
  Flag,
  Edit,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";

import { useAppSelector } from "@/store/hooks";
import {
  useGetPostByIdQuery,
  useLikePostMutation,
  useUnlikePostMutation,
  useGetCommentsQuery,
  useAddCommentMutation,
  useDeletePostMutation,
} from "@/store/apis/post-api";
import { useGetUserByIdQuery } from "@/store/apis/user-api";

// Helper function for Instagram-like relative time
const getRelativeTime = (date: Date | string): string => {
  const now = new Date();
  const postDate = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - postDate.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d`;
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) return `${diffInWeeks}w`;
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths}mo`;
  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears}y`;
};

// Helper function to get initials
const getInitials = (name?: string) => {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0]?.toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

const Post = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const authUser = useAppSelector((s) => s.auth.user);
  const currentUserId = authUser?.id;

  const [commentText, setCommentText] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Fetch post data
  const {
    data: post,
    isLoading: postLoading,
    error: postError,
  } = useGetPostByIdQuery(postId!, {
    skip: !postId,
  });

  // Fetch current user data for avatar
  const { data: currentUser } = useGetUserByIdQuery(currentUserId!, {
    skip: !currentUserId,
  });

  // Fetch comments
  const {
    data: commentsData,
    isLoading: commentsLoading,
    refetch: refetchComments,
  } = useGetCommentsQuery(
    { postId: postId!, limit: 50, offset: 0 },
    { skip: !postId },
  );

  // Mutations
  const [likePost, { isLoading: liking }] = useLikePostMutation();
  const [unlikePost, { isLoading: unliking }] = useUnlikePostMutation();
  const [addComment, { isLoading: commenting }] = useAddCommentMutation();
  const [deletePost, { isLoading: deleting }] = useDeletePostMutation();

  const liked = post?.viewer?.liked ?? false;
  const isOwner = post?.author?.id === currentUserId;

  const authorName =
    post?.author?.profile?.fullName ||
    post?.author?.email?.split("@")[0] ||
    "User";
  const authorInitials = getInitials(authorName);

  const currentUserInitials = getInitials(
    currentUser?.fullName || currentUser?.username || authUser?.email,
  );

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleAvatarClick = () => {
    navigate(`/dashboard/profile/${post?.author?.id}`);
  };

  const handleToggleLike = async () => {
    if (!postId) return;
    try {
      if (liked) {
        await unlikePost(postId).unwrap();
      } else {
        await likePost(postId).unwrap();
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update like");
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !postId) return;

    try {
      await addComment({
        postId,
        content: commentText,
      }).unwrap();

      toast.success("Comment added");
      setCommentText("");
      refetchComments();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to add comment");
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard");
  };

  const handleReport = () => {
    toast.message("Reported", {
      description: "Thanks! We'll review this post.",
    });
  };

  const handleDeletePost = async () => {
    if (!postId) return;
    try {
      await deletePost(postId).unwrap();
      toast.success("Post deleted");
      navigate(-1);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete post");
    }
  };

  // Loading state
  if (postLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleGoBack}
          className="mb-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <Skeleton className="h-64 w-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (postError || !post) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <p className="text-red-500 mb-4">Failed to load post</p>
        <Button variant="outline" onClick={handleGoBack}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Back button */}
      <Button variant="ghost" size="sm" onClick={handleGoBack} className="mb-2">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      {/* Post Card */}
      <Card className="overflow-hidden border bg-background shadow-sm">
        <CardContent className="p-0">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <button
                onClick={handleAvatarClick}
                className="focus:outline-none"
              >
                <Avatar className="h-10 w-10 cursor-pointer transition hover:opacity-80">
                  <AvatarImage src={post.author.profile?.avatar || ""} />
                  <AvatarFallback>{authorInitials}</AvatarFallback>
                </Avatar>
              </button>

              <div className="flex flex-col leading-tight">
                <button
                  onClick={handleAvatarClick}
                  className="text-sm font-semibold text-left hover:underline focus:outline-none"
                >
                  {authorName}
                </button>
                <span className="text-xs text-muted-foreground">
                  {getRelativeTime(post.createdAt)}
                </span>
              </div>
            </div>

            {/* 3 Dots Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-full p-2 hover:bg-muted transition">
                  <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-44">
                {isOwner && (
                  <DropdownMenuItem onClick={() => {}}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit post
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem onClick={handleCopyLink}>
                  <Link2 className="mr-2 h-4 w-4" />
                  Copy link
                </DropdownMenuItem>

                <DropdownMenuItem onClick={handleReport}>
                  <Flag className="mr-2 h-4 w-4" />
                  Report
                </DropdownMenuItem>

                {isOwner && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setDeleteDialogOpen(true)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Image with Background Color */}
          {post.image && (
            <div
              className="w-full flex items-center justify-center bg-black"
              style={{ backgroundColor: post.backgroundColor || "#000000" }}
            >
              <img
                src={post.image}
                alt="post"
                className="w-full max-h-150 object-contain"
              />
            </div>
          )}

          {/* Content */}
          <div className="px-4 py-3 space-y-3">
            {/* Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleToggleLike}
                  disabled={liking || unliking}
                  className="rounded-full p-1 hover:bg-muted transition"
                >
                  <Heart
                    className={cn(
                      "h-6 w-6",
                      liked && "fill-red-500 text-red-500",
                    )}
                  />
                </button>

                <button className="rounded-full p-1 hover:bg-muted transition">
                  <MessageCircle className="h-6 w-6" />
                </button>

                <button className="rounded-full p-1 hover:bg-muted transition">
                  <Send className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Likes */}
            <div className="text-sm font-semibold">{post.likeCount} likes</div>

            {/* Caption */}
            <div className="text-sm leading-relaxed">
              <button
                onClick={handleAvatarClick}
                className="font-semibold mr-2 hover:underline focus:outline-none"
              >
                {authorName}
              </button>
              {post.content}
            </div>

            {/* Comment count */}
            {post.commentCount > 0 && (
              <div className="text-xs text-muted-foreground pt-2">
                View all {post.commentCount} comments
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Comments Section */}
      <Card className="border bg-background shadow-sm">
        <CardContent className="p-4 space-y-4">
          <h3 className="font-semibold">Comments</h3>

          {/* Comments List */}
          <div className="space-y-4 max-h-100 overflow-y-auto">
            {commentsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : commentsData?.data?.length ? (
              commentsData.data.map((comment) => {
                const commentAuthorName =
                  comment.author.profile?.fullName ||
                  comment.author.email.split("@")[0];
                const commentAuthorInitials = getInitials(commentAuthorName);

                return (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.author.profile?.avatar || ""} />
                      <AvatarFallback>{commentAuthorInitials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-semibold">
                          {commentAuthorName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {getRelativeTime(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No comments yet. Be the first to comment!
              </p>
            )}
          </div>

          <Separator />

          {/* Add Comment */}
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={currentUser?.avatar || ""} />
              <AvatarFallback>{currentUserInitials}</AvatarFallback>
            </Avatar>
            <Input
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleAddComment();
                }
              }}
              className="flex-1"
            />
            <Button
              onClick={handleAddComment}
              disabled={commenting || !commentText.trim()}
              size="sm"
            >
              {commenting ? "Posting..." : "Post"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeletePost}
        title="Delete post?"
        description="This action cannot be undone. This will permanently delete your post."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        loading={deleting}
      />
    </div>
  );
};

export default Post;

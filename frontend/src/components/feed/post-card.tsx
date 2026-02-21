import { useState } from "react";
import {
  Heart,
  MessageCircle,
  Send,
  MoreHorizontal,
  Trash2,
  Link2,
  Flag,
  Edit,
  Camera,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";

import type { Post } from "@/store/apis/post-api";

import {
  useLikePostMutation,
  useUnlikePostMutation,
  useGetCommentsQuery,
  useAddCommentMutation,
  useDeletePostMutation,
  useUpdatePostMutation,
} from "@/store/apis/post-api";

import { useAppSelector } from "@/store/hooks";

interface PostCardProps {
  post: Post;
}

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

export const PostCard = ({ post }: PostCardProps) => {
  const navigate = useNavigate();
  const authUser = useAppSelector((s) => s.auth.user);
  const currentUserId = authUser?.id;

  const [commentText, setCommentText] = useState("");
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editPreview, setEditPreview] = useState<string | null>(null);

  const [likePost, { isLoading: liking }] = useLikePostMutation();
  const [unlikePost, { isLoading: unliking }] = useUnlikePostMutation();
  const [addComment, { isLoading: commenting }] = useAddCommentMutation();
  const [deletePost, { isLoading: deleting }] = useDeletePostMutation();
  const [updatePost, { isLoading: updating }] = useUpdatePostMutation();

  const { data: commentsData, isLoading: commentsLoading } =
    useGetCommentsQuery(
      { postId: post.id, limit: 20, offset: 0 },
      { skip: !commentsOpen },
    );

  const liked = post.viewer?.liked ?? false;
  const isOwner = post.author.id === currentUserId;

  const authorName =
    post.author.profile?.fullName || post.author.email.split("@")[0];
  const avatarFallback = authorName.charAt(0).toUpperCase();

  const handleAvatarClick = () => {
    navigate(`/dashboard/profile/${post.author.id}`);
  };

  const handleUsernameClick = () => {
    navigate(`/dashboard/profile/${post.author.id}`);
  };

  const handleToggleLike = async () => {
    try {
      if (liked) {
        await unlikePost(post.id).unwrap();
        toast.success("Unliked");
      } else {
        await likePost(post.id).unwrap();
        toast.success("Liked");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update like");
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;

    try {
      await addComment({
        postId: post.id,
        content: commentText,
      }).unwrap();

      toast.success("Comment added");
      setCommentText("");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to add comment");
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/post/${post.id}`,
      );
      toast.success("Link copied");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleReport = () => {
    toast.message("Reported", {
      description: "Thanks! We will review this post.",
    });
  };

  const handleDeletePost = async () => {
    try {
      await deletePost(post.id).unwrap();
      toast.success("Post deleted");
      setDeleteDialogOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete post");
    }
  };

  const handleEditClick = () => {
    setEditContent(post.content);
    setEditFile(null);
    setEditPreview(null);
    setEditDialogOpen(true);
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return;
    }

    setEditFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setEditPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveEditImage = () => {
    setEditFile(null);
    setEditPreview(null);
  };

  const handleUpdatePost = async () => {
    if (!editContent.trim()) {
      toast.error("Post content cannot be empty");
      return;
    }

    const formData = new FormData();
    formData.append("content", editContent.trim());

    if (editFile) {
      formData.append("image", editFile);
    }

    // If user wants to remove image
    if (post.image && !editFile && !editPreview) {
      formData.append("image", "null");
    }

    try {
      await updatePost({
        postId: post.id,
        body: formData,
      }).unwrap();
      toast.success("Post updated successfully");
      setEditDialogOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update post");
    }
  };

  return (
    <>
      {/* ---------------- FEED CARD ---------------- */}
      <Card className="overflow-hidden border border-border/50 bg-card shadow-sm hover:shadow-md transition-shadow duration-300 rounded-xl">
        <CardContent className="p-0">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              {/* Avatar - Clickable */}
              <button
                onClick={handleAvatarClick}
                className="focus:outline-none"
              >
                <Avatar className="h-9 w-9 cursor-pointer transition hover:opacity-80">
                  <AvatarImage src={post.author.profile?.avatar || ""} />
                  <AvatarFallback>{avatarFallback}</AvatarFallback>
                </Avatar>
              </button>

              <div className="flex flex-col leading-tight">
                {/* Author Name - Clickable */}
                <button
                  onClick={handleUsernameClick}
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
                {/* Edit Option - Only for post owner */}
                {isOwner && (
                  <DropdownMenuItem onClick={handleEditClick}>
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

                {/* Delete Option - Only for post owner */}
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
              className="w-full flex items-center justify-center"
              style={{ backgroundColor: post.backgroundColor || "#000000" }}
            >
              <img
                src={post.image}
                alt="post"
                className="w-full max-h-120 object-contain"
              />
            </div>
          )}

          {/* Content */}
          <div className="px-4 py-3 space-y-2">
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
                      "h-6 w-6 transition-all duration-300",
                      liked ? "fill-primary text-primary scale-110" : "hover:text-primary",
                    )}
                  />
                </button>

                <button
                  onClick={() => setCommentsOpen(true)}
                  className="rounded-full p-1 hover:bg-muted transition"
                >
                  <MessageCircle className="h-6 w-6" />
                </button>

                <button className="rounded-full p-1 hover:bg-muted transition">
                  <Send className="h-6 w-6" />
                </button>
              </div>

              {/* Counters */}
              <div className="text-xs text-muted-foreground">
                {post.commentCount} comments
              </div>
            </div>

            {/* Likes */}
            <div className="text-sm font-semibold">{post.likeCount} likes</div>

            {/* Caption */}
            <div className="text-sm leading-relaxed">
              <button
                onClick={handleUsernameClick}
                className="font-semibold mr-2 hover:underline focus:outline-none"
              >
                {authorName}
              </button>
              {post.content}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ---------------- COMMENTS DIALOG ---------------- */}
      <Dialog open={commentsOpen} onOpenChange={setCommentsOpen}>
        <DialogContent 
          className={cn(
            "w-[95vw] p-0 overflow-hidden",
            post.image ? "sm:max-w-6xl" : "sm:max-w-3xl"
          )}
        >
          <div className={cn("grid grid-cols-1", post.image && "md:grid-cols-[1.3fr_1fr]")}>
            {/* Left: Image */}
            {post.image && (
              <div className="bg-black flex items-center justify-center h-[80vh]">
                <img
                  src={post.image}
                  alt="post"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Right: Comments */}
            <div className="flex flex-col h-[80vh] bg-background">
              <DialogHeader className="border-b pl-4 pr-12 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleAvatarClick}
                      className="focus:outline-none"
                    >
                      <Avatar className="h-8 w-8 cursor-pointer transition hover:opacity-80">
                        <AvatarImage src={post.author.profile?.avatar || ""} />
                        <AvatarFallback>{avatarFallback}</AvatarFallback>
                      </Avatar>
                    </button>

                    <div className="flex flex-col">
                      <button
                        onClick={handleUsernameClick}
                        className="font-semibold text-sm text-left hover:underline focus:outline-none"
                      >
                        {authorName}
                      </button>
                      <span className="text-xs text-muted-foreground">
                        {getRelativeTime(post.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{post.likeCount} likes</span>
                    <span>•</span>
                    <span>{post.commentCount} comments</span>
                  </div>
                </div>
              </DialogHeader>

              {/* Comments List */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                {commentsLoading ? (
                  <div className="text-sm text-muted-foreground">
                    Loading comments...
                  </div>
                ) : commentsData?.data.length ? (
                  commentsData.data.map((comment) => (
                    <div key={comment.id} className="text-sm">
                      <button
                        onClick={() =>
                          navigate(`/dashboard/profile/${comment.author.id}`)
                        }
                        className="font-semibold mr-2 hover:underline focus:outline-none"
                      >
                        {comment.author.profile?.fullName ||
                          comment.author.email.split("@")[0]}
                      </button>
                      <span className="text-muted-foreground">
                        {comment.content}
                      </span>
                      <div className="text-xs text-muted-foreground mt-1">
                        {getRelativeTime(comment.createdAt)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground text-center py-8">
                    No comments yet. Be the first one 👀
                  </div>
                )}
              </div>

              {/* Add Comment */}
              <div className="border-t px-4 py-3">
                <div className="flex items-center gap-2">
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
                  />
                  <Button
                    onClick={handleAddComment}
                    disabled={commenting || !commentText.trim()}
                    size="sm"
                  >
                    {commenting ? "Posting..." : "Post"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ---------------- EDIT POST DIALOG ---------------- */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl w-[95vw]">
          <DialogHeader>
            <DialogTitle>Edit post</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Textarea
              placeholder="What's on your mind?"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={4}
              className="resize-none"
            />

            <div className="space-y-2">
              <Label>Image (optional)</Label>

              {editPreview || post.image ? (
                <div className="relative">
                  <img
                    src={editPreview || post.image || ""}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute top-2 right-2 h-8 w-8 rounded-full"
                    onClick={handleRemoveEditImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      document.getElementById("edit-image")?.click()
                    }
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Upload Image
                  </Button>
                  <input
                    id="edit-image"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleEditFileChange}
                  />
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              disabled={updating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdatePost}
              disabled={updating || !editContent.trim()}
            >
              {updating ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---------------- DELETE CONFIRMATION DIALOG ---------------- */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeletePost}
        title="Delete post?"
        description="This action cannot be undone. This will permanently delete your post and remove it from your profile and feed."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        loading={deleting}
      />
    </>
  );
};

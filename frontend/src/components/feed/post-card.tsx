import { useState } from "react";
import { Heart, MessageCircle, Send } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

import type { Post, Comment, Reply } from "@/types/feed";

interface PostCardProps {
  post: Post;
}

export const PostCard = ({ post }: PostCardProps) => {
  const [liked, setLiked] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<Comment[]>(post.comments);
  const [commentsOpen, setCommentsOpen] = useState(false);

  const handleAddComment = () => {
    if (!commentText.trim()) return;

    const newComment: Comment = {
      id: Date.now(),
      user: "you",
      text: commentText,
      replies: [],
    };

    setComments((prev) => [...prev, newComment]);
    setCommentText("");
  };

  return (
    <>
      {/* ---------------- Feed Card ---------------- */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3">
            <Avatar>
              <AvatarImage src={post.user.avatar} />
              <AvatarFallback>{post.user.name.charAt(0)}</AvatarFallback>
            </Avatar>

            <div className="flex flex-col">
              <span className="text-sm font-medium">{post.user.username}</span>
              <span className="text-xs text-muted-foreground">
                {post.createdAt}
              </span>
            </div>
          </div>

          {/* Image */}
          <img
            src={post.image}
            alt="post"
            className="w-full h-50 object-cover"
          />

          {/* Actions */}
          <div className="flex items-center gap-4 px-4 py-3">
            <button onClick={() => setLiked((v) => !v)}>
              <Heart
                className={cn("h-6 w-6", liked && "fill-red-500 text-red-500")}
              />
            </button>

            {/* OPEN COMMENTS DIALOG */}
            <button onClick={() => setCommentsOpen(true)}>
              <MessageCircle className="h-6 w-6" />
            </button>

            <Send className="h-6 w-6" />
          </div>

          {/* Likes */}
          <div className="px-4 text-sm font-medium">
            {liked ? post.likes + 1 : post.likes} likes
          </div>

          {/* Caption */}
          <div className="px-4 py-2 text-sm">
            <span className="font-medium mr-1">{post.user.username}</span>
            {post.caption}
          </div>
        </CardContent>
      </Card>

      {/* ---------------- COMMENTS DIALOG ---------------- */}
      <Dialog open={commentsOpen} onOpenChange={setCommentsOpen}>
        <DialogContent className="max-w-6xl p-0 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Left: Image */}
            <img
              src={post.image}
              alt="post"
              className="h-full w-full object-cover"
            />

            {/* Right: Comments */}
            <div className="flex flex-col">
              <DialogHeader className="border-b px-4 py-3">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={post.user.avatar} />
                    <AvatarFallback>{post.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{post.user.username}</span>
                </div>
              </DialogHeader>

              {/* Comments List */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                {comments.map((comment) => (
                  <CommentItem key={comment.id} comment={comment} />
                ))}
              </div>

              {/* Add Comment */}
              <div className="flex items-center gap-2 border-t px-4 py-3">
                <Input
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <Button onClick={handleAddComment}>Post</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

/* ---------------- Comment ---------------- */

interface CommentItemProps {
  comment: Comment;
}

const CommentItem = ({ comment }: CommentItemProps) => {
  const [replyText, setReplyText] = useState("");
  const [replies, setReplies] = useState<Reply[]>(comment.replies);
  const [showReply, setShowReply] = useState(false);

  const handleAddReply = () => {
    if (!replyText.trim()) return;

    const newReply: Reply = {
      id: Date.now(),
      user: "you",
      text: replyText,
    };

    setReplies((prev) => [...prev, newReply]);
    setReplyText("");
    setShowReply(false);
  };

  return (
    <div className="text-sm">
      <span className="font-medium mr-1">{comment.user}</span>
      {comment.text}

      <button
        className="ml-2 text-xs text-muted-foreground"
        onClick={() => setShowReply((v) => !v)}
      >
        Reply
      </button>

      {/* Replies */}
      <div className="ml-4 mt-1 space-y-1">
        {replies.map((reply) => (
          <div key={reply.id}>
            <span className="font-medium mr-1">{reply.user}</span>
            {reply.text}
          </div>
        ))}
      </div>

      {/* Reply Input */}
      {showReply && (
        <div className="ml-4 mt-2 flex items-center gap-2">
          <Input
            placeholder="Write a reply..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            className="h-8"
          />
          <Button size="sm" onClick={handleAddReply}>
            Reply
          </Button>
        </div>
      )}
    </div>
  );
};

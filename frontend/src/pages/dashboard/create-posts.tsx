import { useRef, useState } from "react";
import { z } from "zod";
import { ImagePlus, X } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { useCreatePostMutation } from "@/store/apis/post-api";
import { useAppSelector } from "@/store/hooks";
import { useGetUserByIdQuery } from "@/store/apis/user-api";

const MAX_CAPTION_LENGTH = 2200;

/* =============================
   ZOD SCHEMA
============================= */
const createPostSchema = z.object({
  caption: z
    .string()
    .trim()
    .min(1, "Caption is required")
    .max(
      MAX_CAPTION_LENGTH,
      `Caption must be under ${MAX_CAPTION_LENGTH} chars`,
    ),

  imageFile: z
    .instanceof(File, { message: "Image is required" })
    .refine((file) => file.type.startsWith("image/"), {
      message: "Only image files are allowed",
    })
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: "Image must be less than 5MB",
    }),
});

const CreatePosts = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [caption, setCaption] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [createPost, { isLoading }] = useCreatePostMutation();

  // ✅ Auth user only has {id, email}
  const authUser = useAppSelector((state) => state.auth.user);

  // ✅ Fetch full user info (profile, avatar, etc.)
  const { data: fullUser, isLoading: userLoading } = useGetUserByIdQuery(
    authUser?.id || "",
    { skip: !authUser?.id },
  );

  const displayName =
    fullUser?.profile?.fullName ||
    fullUser?.email?.split("@")[0] ||
    authUser?.email?.split("@")[0] ||
    "User";

  const avatarUrl = fullUser?.profile?.avatar || "";

  const avatarFallback = displayName.charAt(0).toUpperCase();

  const handleImageSelect = (file: File) => {
    setImageFile(file);

    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImagePreview(null);
    setImageFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!authUser?.id) {
      toast.error("You must be logged in to create a post");
      return;
    }

    // ✅ Zod validation
    const parsed = createPostSchema.safeParse({
      caption,
      imageFile,
    });

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message || "Invalid input");
      return;
    }

    // ✅ Build FormData for backend (NestJS FileInterceptor('image'))
    const formData = new FormData();
    formData.append("content", parsed.data.caption);
    formData.append("image", parsed.data.imageFile);

    try {
      await createPost(formData).unwrap();

      toast.success("Post published 🎉");

      setCaption("");
      clearImage();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to create post");
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create new post</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* User */}
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback>{avatarFallback}</AvatarFallback>
            </Avatar>

            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold">
                {userLoading ? "Loading..." : displayName}
              </span>

              <span className="text-xs text-muted-foreground">
                {fullUser?.email || authUser?.email}
              </span>
            </div>
          </div>

          {/* Image Upload */}
          {!imagePreview ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex h-64 w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed text-muted-foreground hover:bg-muted transition"
            >
              <ImagePlus className="h-8 w-8" />
              <span>Select an image</span>
            </button>
          ) : (
            <div className="relative">
              <img
                src={imagePreview}
                alt="preview"
                className="w-full rounded-md object-cover"
              />

              <button
                type="button"
                onClick={clearImage}
                className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageSelect(file);
            }}
          />

          {/* Caption */}
          <div className="space-y-2">
            <Textarea
              placeholder="Write a caption..."
              value={caption}
              maxLength={MAX_CAPTION_LENGTH}
              onChange={(e) => setCaption(e.target.value)}
              rows={4}
            />

            <div className="text-right text-xs text-muted-foreground">
              {caption.length}/{MAX_CAPTION_LENGTH}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={!imageFile || caption.trim().length === 0 || isLoading}
            >
              {isLoading ? "Publishing..." : "Publish"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreatePosts;

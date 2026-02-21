import { useRef, useState } from "react";
import { z } from "zod";
import { ImagePlus, X } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

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
    <div className="max-w-2xl mx-auto p-2 sm:p-4">
      <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300 rounded-xl overflow-hidden bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/40">
        <CardHeader className="border-b border-border/40 bg-muted/20 pb-4">
          <CardTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">Create new post</CardTitle>
          <CardDescription>Share a photo and your thoughts with your connections.</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {/* User */}
          <div className="flex items-center gap-3">
            <Avatar className="h-11 w-11 ring-2 ring-primary/10">
              <AvatarImage src={avatarUrl} className="object-cover" />
              <AvatarFallback className="bg-primary/10 text-primary font-medium">{avatarFallback}</AvatarFallback>
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
              className="group flex h-72 w-full flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-border/60 bg-muted/10 text-muted-foreground hover:bg-muted/30 hover:border-primary/50 transition-all duration-300"
            >
              <div className="h-16 w-16 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <ImagePlus className="h-8 w-8" />
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="font-semibold text-foreground">Click to upload an image</span>
                <span className="text-xs">SVG, PNG, JPG or GIF (max. 5MB)</span>
              </div>
            </button>
          ) : (
            <div className="relative group rounded-xl overflow-hidden border border-border/40 shadow-sm bg-black/5 flex justify-center">
              <img
                src={imagePreview}
                alt="preview"
                className="w-full max-h-[500px] object-contain rounded-xl"
              />
              
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none" />

              <button
                type="button"
                onClick={clearImage}
                className="absolute right-3 top-3 rounded-full bg-black/60 p-2 text-white hover:bg-red-500/90 transition-colors shadow-sm opacity-0 group-hover:opacity-100"
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
              placeholder="What's on your mind? Write a compelling caption..."
              value={caption}
              maxLength={MAX_CAPTION_LENGTH}
              onChange={(e) => setCaption(e.target.value)}
              rows={4}
              className="resize-none rounded-xl bg-muted/20 border-border/50 focus-visible:ring-primary/30 text-base"
            />

            <div className="flex justify-between items-center px-1">
              <span className="text-xs text-muted-foreground">
                Make it count
              </span>
              <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                {caption.length}/{MAX_CAPTION_LENGTH}
              </span>
            </div>
          </div>
          
          <Separator className="bg-border/40" />

          {/* Actions */}
          <div className="flex justify-end pt-2">
            <Button
              onClick={handleSubmit}
              disabled={!imageFile || caption.trim().length === 0 || isLoading}
              className="rounded-full px-8 py-5 shadow-sm hover:shadow-md transition-all duration-300 font-semibold text-sm"
            >
              {isLoading ? "Publishing..." : "Publish Post"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreatePosts;

"use client";

import { useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const MAX_CAPTION_LENGTH = 2200;

const CreatePosts = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [image, setImage] = useState<string | null>(null);
  const [caption, setCaption] = useState("");

  const handleImageSelect = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!image) return;

    const payload = {
      image,
      caption,
    };

    console.log("CREATE POST:", payload);
    // call API later
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
            <Avatar>
              <AvatarImage src="https://i.pravatar.cc/150?img=12" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">johndoe</span>
          </div>

          {/* Image Upload */}
          {!image ? (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex h-64 w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed text-muted-foreground hover:bg-muted transition"
            >
              <ImagePlus className="h-8 w-8" />
              <span>Select an image</span>
            </button>
          ) : (
            <div className="relative">
              <img
                src={image}
                alt="preview"
                className="w-full rounded-md object-cover"
              />

              <button
                onClick={() => setImage(null)}
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
            <Button onClick={handleSubmit} disabled={!image}>
              Publish
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreatePosts;

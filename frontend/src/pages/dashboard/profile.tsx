import { useState } from "react";
import { Grid } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { useAppSelector } from "@/store/hooks";
import {
  useGetUserByIdQuery,
  useUpdateProfileMutation,
} from "@/store/apis/user-api";

/* ---------------- Helpers ---------------- */

const getInitials = (name: string) => {
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0]?.toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

const dummyPosts = Array.from({ length: 12 }).map((_, i) => ({
  id: `post-${i}`,
  image: `https://picsum.photos/600/600?random=${i + 1}`,
}));

/* ---------------- Component ---------------- */

const Profile = () => {
  const authUser = useAppSelector((s) => s.auth.user);
  const userId = authUser?.id as string;

  const { data: user, isLoading } = useGetUserByIdQuery(userId);
  const [updateProfile, { isLoading: saving }] = useUpdateProfileMutation();

  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState({
    fullName: "",
    username: "",
    bio: "",
    website: "",
  });

  /* populate editable state only when modal opens */
  const handleOpenChange = (value: boolean) => {
    setOpen(value);

    if (value && user) {
      setProfile({
        fullName: user.profile.fullName,
        username: user.username,
        bio: user.profile.bio || "",
        website: user.profile.website || "",
      });
    }
  };

  const handleSave = async () => {
    const formData = new FormData();
    formData.append("fullName", profile.fullName);
    formData.append("username", profile.username);
    formData.append("bio", profile.bio);
    formData.append("website", profile.website);

    await updateProfile(formData).unwrap();
    setOpen(false);
  };

  if (isLoading || !user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center">
        <Avatar className="h-28 w-28">
          <AvatarImage src={user.profile.avatar || ""} />
          <AvatarFallback className="text-2xl font-semibold">
            {getInitials(user.profile.fullName)}
          </AvatarFallback>
        </Avatar>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold">{user.username}</h2>

            {/* Edit Profile */}
            <Dialog open={open} onOpenChange={handleOpenChange}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  Edit profile
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Edit profile</DialogTitle>
                  <DialogDescription>
                    Update your personal information.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Full name</Label>
                    <Input
                      value={profile.fullName}
                      onChange={(e) =>
                        setProfile({ ...profile, fullName: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Username</Label>
                    <Input
                      value={profile.username}
                      onChange={(e) =>
                        setProfile({ ...profile, username: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Bio</Label>
                    <Textarea
                      rows={3}
                      value={profile.bio}
                      onChange={(e) =>
                        setProfile({ ...profile, bio: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Website</Label>
                    <Input
                      value={profile.website}
                      onChange={(e) =>
                        setProfile({ ...profile, website: e.target.value })
                      }
                    />
                  </div>
                </div>

                <DialogFooter className="mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setOpen(false)}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? "Saving..." : "Save changes"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex gap-6 text-sm">
            <span>
              <strong>5</strong> posts
            </span>
            <span>
              <strong>{user.followersCount}</strong> followers
            </span>
            <span>
              <strong>{user.followingCount}</strong> following
            </span>
          </div>

          <div className="text-sm">
            <p className="font-medium">{user.profile.fullName}</p>
            <p className="text-muted-foreground">{user.profile.bio}</p>
          </div>
        </div>
      </div>

      {/* ================= TABS ================= */}
      <div className="flex justify-center gap-2 border-t pt-4">
        <Grid className="h-5 w-5" />
        <span className="text-sm font-medium">Posts</span>
      </div>

      {/* ================= POSTS GRID ================= */}
      <div className="grid grid-cols-3 gap-1 md:gap-4">
        {dummyPosts.map((post) => (
          <Card key={post.id} className="aspect-square overflow-hidden">
            <img
              src={post.image}
              alt="post"
              className="h-full w-full object-cover transition hover:scale-105"
            />
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Profile;

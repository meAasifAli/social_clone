/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Grid, Camera, X, UserPlus, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { useParams } from "react-router-dom";

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
  useFollowUserMutation,
  useUnfollowUserMutation,
} from "@/store/apis/user-api";

import { useGetFeedQuery } from "@/store/apis/post-api";

/* ---------------- Helpers ---------------- */

const getInitials = (name?: string) => {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0]?.toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

// Skeleton Loader Component
const ProfileSkeleton = () => (
  <div className="max-w-4xl mx-auto space-y-8">
    <div className="flex flex-col gap-6 md:flex-row md:items-start animate-pulse">
      <div className="h-28 w-28 rounded-full bg-muted" />
      <div className="space-y-4 flex-1">
        <div className="h-8 w-48 bg-muted rounded" />
        <div className="flex gap-6">
          <div className="h-4 w-16 bg-muted rounded" />
          <div className="h-4 w-16 bg-muted rounded" />
          <div className="h-4 w-16 bg-muted rounded" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-32 bg-muted rounded" />
          <div className="h-4 w-48 bg-muted rounded" />
        </div>
      </div>
    </div>
    <div className="grid grid-cols-3 gap-1 md:gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="aspect-square bg-muted rounded" />
      ))}
    </div>
  </div>
);

/* ---------------- Component ---------------- */

const Profile = () => {
  const { userId: profileUserId } = useParams<{ userId: string }>();
  const authUser = useAppSelector((s) => s.auth.user);
  const currentUserId = authUser?.id;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const initialLoadRef = useRef(true);

  // Debug logs
  useEffect(() => {
    console.log("🔍 PROFILE MOUNT/UPDATE:", {
      profileUserIdFromUrl: profileUserId,
      currentUserId,
      path: window.location.pathname,
      timestamp: new Date().toISOString(),
    });
  }, [profileUserId, currentUserId]);

  // Memoize target user ID - this changes when URL param changes
  const targetUserId = useMemo(
    () => profileUserId || currentUserId,
    [profileUserId, currentUserId],
  );

  const isOwnProfile = useMemo(
    () => !profileUserId || profileUserId === currentUserId,
    [profileUserId, currentUserId],
  );

  // Log when targetUserId changes
  useEffect(() => {
    console.log("🎯 TARGET USER ID CHANGED:", {
      targetUserId,
      profileUserId,
      currentUserId,
      isOwnProfile,
    });
  }, [targetUserId, profileUserId, currentUserId, isOwnProfile]);

  /* =============================
     QUERIES - with force refetch
  ============================= */
  const {
    data: user,
    isLoading: userLoading,
    isError: userIsError,
    error: userError,
    refetch: refetchUser,
  } = useGetUserByIdQuery(targetUserId!, {
    skip: !targetUserId,
    // Force refetch when targetUserId changes
    refetchOnMountOrArgChange: true,
  });

  // Log when user data is received
  useEffect(() => {
    if (user) {
      console.log("✅ USER DATA RECEIVED:", {
        requestedId: targetUserId,
        receivedUser: {
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          isFollowing: user.isFollowing,
          followersCount: user.followersCount,
          followingCount: user.followingCount,
        },
      });
    }
  }, [user, targetUserId]);

  const {
    data: postsData,
    isLoading: postsLoading,
    isError: postsIsError,
    error: postsError,
    refetch: refetchPosts,
  } = useGetFeedQuery(
    {
      authorId: targetUserId!,
      limit: 30,
      offset: 0,
    },
    {
      skip: !targetUserId,
      refetchOnMountOrArgChange: true,
    },
  );

  /* =============================
     MUTATIONS
  ============================= */
  const [followUser, { isLoading: isFollowLoading }] = useFollowUserMutation();
  const [unfollowUser, { isLoading: isUnfollowLoading }] =
    useUnfollowUserMutation();
  const [updateProfile, { isLoading: isSaving }] = useUpdateProfileMutation();

  /* =============================
     LOCAL STATE
  ============================= */
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState({
    fullName: "",
    username: "",
    bio: "",
    website: "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Derived state
  const isFollowButtonLoading = isFollowLoading || isUnfollowLoading;
  const isFollowing = user?.isFollowing ?? false;
  const displayName =
    user?.fullName || user?.username || user?.email?.split("@")[0] || "User";
  const avatarUrl = user?.avatar || "";
  const postsCount = postsData?.total ?? 0;

  // Update profile form when user data loads (only for own profile)
  useEffect(() => {
    if (!user || !isOwnProfile) return;

    if (initialLoadRef.current || user.id) {
      initialLoadRef.current = false;

      setProfile({
        fullName: user.fullName || "",
        username: user.username || "",
        bio: user.bio || "",
        website: user.website || "",
      });
    }
  }, [user, isOwnProfile]);

  // Handle errors
  useEffect(() => {
    if (postsIsError) {
      console.log("POSTS ERROR:", postsError);
      toast.error("Failed to load posts");
    }
  }, [postsIsError, postsError]);

  /* =============================
     HANDLERS
  ============================= */
  const handleOpenChange = useCallback((value: boolean) => {
    setOpen(value);
    if (!value) {
      setAvatarFile(null);
      setAvatarPreview(null);
    }
  }, []);

  const handleAvatarClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleAvatarChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
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

      setAvatarFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    },
    [],
  );

  const handleRemoveAvatar = useCallback(() => {
    setAvatarFile(null);
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const handleSave = useCallback(async () => {
    if (!profile.fullName.trim()) {
      toast.error("Full name is required");
      return;
    }

    if (!profile.username.trim()) {
      toast.error("Username is required");
      return;
    }

    const formData = new FormData();
    formData.append("fullName", profile.fullName.trim());
    formData.append("bio", profile.bio.trim());
    formData.append("website", profile.website.trim());

    if (profile.username.trim()) {
      formData.append("username", profile.username.trim());
    }

    if (avatarFile) {
      formData.append("avatar", avatarFile);
    }

    try {
      await updateProfile(formData).unwrap();
      toast.success("Profile updated ✅");
      setOpen(false);
      refetchUser();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update profile");
    }
  }, [profile, avatarFile, updateProfile, refetchUser]);

  const handleFollowToggle = useCallback(async () => {
    if (!targetUserId || !currentUserId) {
      toast.error("Unable to process request");
      return;
    }

    const username = user?.username;
    const wasFollowing = user?.isFollowing ?? false;

    try {
      if (wasFollowing) {
        await unfollowUser(targetUserId).unwrap();
        toast.success(`Unfollowed @${username}`);
      } else {
        await followUser(targetUserId).unwrap();
        toast.success(`Following @${username}`);
      }

      // Refetch user data to update follow status
      refetchUser();
      refetchPosts(); // Refetch posts in case they change with follow status
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update follow status");
    }
  }, [
    targetUserId,
    currentUserId,
    user?.username,
    user?.isFollowing,
    followUser,
    unfollowUser,
    refetchUser,
    refetchPosts,
  ]);

  /* =============================
     RENDER LOGIC
  ============================= */
  if (!targetUserId) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Please login to view a profile.
      </div>
    );
  }

  if (userLoading) {
    return <ProfileSkeleton />;
  }

  if (userIsError || !user) {
    console.log("PROFILE ERROR:", userError);
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">Failed to load profile.</p>
        <Button variant="outline" onClick={() => refetchUser()}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        <div className="relative">
          <Avatar className="h-28 w-28">
            <AvatarImage
              key={avatarPreview || avatarUrl}
              src={avatarPreview || avatarUrl}
            />
            <AvatarFallback className="text-2xl font-semibold">
              {getInitials(displayName)}
            </AvatarFallback>
          </Avatar>

          {isOwnProfile && (
            <Button
              size="icon"
              variant="secondary"
              className="absolute bottom-0 right-0 h-8 w-8 rounded-full opacity-90 hover:opacity-100"
              onClick={handleAvatarClick}
            >
              <Camera className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="space-y-4 flex-1">
          <div className="flex items-center gap-4 flex-wrap">
            <h2 className="text-xl font-semibold">@{user.username}</h2>

            {isOwnProfile ? (
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
                      Update your personal information and avatar.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    {/* Avatar Upload Section */}
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Avatar className="h-16 w-16">
                          <AvatarImage
                            src={avatarPreview || user?.avatar || ""}
                          />
                          <AvatarFallback>
                            {getInitials(profile.fullName || displayName)}
                          </AvatarFallback>
                        </Avatar>

                        {avatarPreview && (
                          <Button
                            size="icon"
                            variant="destructive"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                            onClick={handleRemoveAvatar}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>

                      <div className="flex-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleAvatarClick}
                        >
                          <Camera className="h-4 w-4 mr-2" />
                          {avatarFile ? "Change avatar" : "Upload avatar"}
                        </Button>
                        <p className="text-xs text-muted-foreground mt-1">
                          Max size: 5MB. Supported: JPG, PNG, GIF
                        </p>
                      </div>

                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleAvatarChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full name</Label>
                      <Input
                        id="fullName"
                        value={profile.fullName}
                        onChange={(e) =>
                          setProfile({ ...profile, fullName: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={profile.username}
                        onChange={(e) =>
                          setProfile({ ...profile, username: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        rows={3}
                        value={profile.bio}
                        onChange={(e) =>
                          setProfile({ ...profile, bio: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
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
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>

                    <Button onClick={handleSave} disabled={isSaving}>
                      {isSaving ? "Saving..." : "Save changes"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            ) : (
              <Button
                variant={isFollowing ? "outline" : "default"}
                size="sm"
                onClick={handleFollowToggle}
                disabled={isFollowButtonLoading}
                className="min-w-25"
              >
                {isFollowing ? (
                  <>
                    <UserCheck className="h-4 w-4 mr-2" />
                    {isFollowButtonLoading ? "..." : "Following"}
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    {isFollowButtonLoading ? "..." : "Follow"}
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Stats */}
          <div className="flex gap-6 text-sm">
            <span>
              <strong>{postsCount}</strong> &middot; posts
            </span>
            <span>
              <strong>{user.followersCount ?? 0}</strong> &middot; followers
            </span>
            <span>
              <strong>{user.followingCount ?? 0}</strong> &middot; following
            </span>
          </div>

          {/* Bio */}
          <div className="space-y-2 text-sm">
            <div>
              <p className="font-medium">{displayName}</p>
              {user?.bio ? (
                <p className="text-muted-foreground mt-1">{user.bio}</p>
              ) : (
                <p className="text-muted-foreground mt-1 italic">No bio yet.</p>
              )}
            </div>

            {user?.website && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9"
                  />
                </svg>
                <a
                  href={
                    user.website.startsWith("http")
                      ? user.website
                      : `https://${user.website}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground hover:underline transition-colors truncate max-w-50"
                >
                  {user.website.replace(/^https?:\/\//, "")}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-2 border-t pt-4">
        <Grid className="h-5 w-5" />
        <span className="text-sm font-medium">Posts</span>
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-3 gap-1 md:gap-4">
        {postsLoading ? (
          <div className="col-span-3 text-center py-8 text-muted-foreground">
            Loading posts...
          </div>
        ) : postsData?.data?.length ? (
          postsData.data.map((post) => (
            <Card key={post.id} className="aspect-square overflow-hidden">
              {post.image ? (
                <img
                  src={post.image}
                  alt="post"
                  className="h-full w-full object-cover transition hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted text-xs text-muted-foreground">
                  No image
                </div>
              )}
            </Card>
          ))
        ) : (
          <div className="col-span-3 text-center py-8 text-muted-foreground">
            {isOwnProfile
              ? "You haven't posted anything yet. Share your first post! ✨"
              : `@${user.username} hasn't posted anything yet.`}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;

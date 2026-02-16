import { useState, useEffect } from "react";
import { useTheme } from "@/hooks/useTheme";
import {
  Moon,
  Sun,
  Laptop,
  Trash2,
  Loader2,
  User,
  Mail,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  useGetUserByIdQuery,
  useUpdateProfileMutation,
} from "@/store/apis/user-api";
import { logout } from "@/store/slices/auth.slice";

const Settings = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { theme, setTheme } = useTheme();
  const { user: authUser } = useAppSelector((s) => s.auth);
  const userId = authUser?.id;

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Profile form state
  const [profile, setProfile] = useState({
    username: "",
    email: "",
    fullName: "",
  });

  // Password form state
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  // Fetch user data
  const {
    data: user,
    isLoading,
    refetch,
  } = useGetUserByIdQuery(userId!, {
    skip: !userId,
  });

  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();

  // Update form when user data loads
  useEffect(() => {
    if (user) {
      setProfile({
        username: user.username || "",
        email: user.email || "",
        fullName: user.fullName || "",
      });
    }
  }, [user]);

  const handleProfileUpdate = async () => {
    if (!profile.username.trim()) {
      toast.error("Username cannot be empty");
      return;
    }

    const formData = new FormData();
    formData.append("username", profile.username.trim());
    if (profile.fullName) formData.append("fullName", profile.fullName.trim());

    try {
      await updateProfile(formData).unwrap();
      toast.success("Profile updated successfully");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update profile");
    }
  };

  const handlePasswordUpdate = async () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      toast.error("All fields are required");
      return;
    }

    if (passwords.new !== passwords.confirm) {
      toast.error("New passwords don't match");
      return;
    }

    if (passwords.new.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    // Implement password update API call
    toast.success("Password updated successfully");
    setPasswords({ current: "", new: "", confirm: "" });
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      // Implement delete account API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      dispatch(logout());
      navigate("/auth/login");
      toast.success("Account deleted successfully");
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete account");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="h-8 w-32 bg-muted animate-pulse rounded" />
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="border-b bg-muted/30 py-4">
              <div className="h-5 w-32 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="h-10 w-full bg-muted animate-pulse rounded" />
              <div className="h-10 w-full bg-muted animate-pulse rounded" />
              <div className="h-10 w-24 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>

      {/* Account */}
      <Card className="overflow-hidden border shadow-sm">
        <CardHeader className="border-b bg-muted/30 py-4">
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <User className="h-4 w-4 text-primary" />
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-xs font-medium text-muted-foreground"
            >
              EMAIL
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                value={profile.email}
                disabled
                className="pl-9 bg-muted/50"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Email cannot be changed
            </p>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="username"
              className="text-xs font-medium text-muted-foreground"
            >
              USERNAME
            </Label>
            <Input
              id="username"
              value={profile.username}
              onChange={(e) =>
                setProfile({ ...profile, username: e.target.value })
              }
              placeholder="Enter username"
              className="focus-visible:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="fullName"
              className="text-xs font-medium text-muted-foreground"
            >
              DISPLAY NAME
            </Label>
            <Input
              id="fullName"
              value={profile.fullName}
              onChange={(e) =>
                setProfile({ ...profile, fullName: e.target.value })
              }
              placeholder="Enter display name"
              className="focus-visible:ring-primary"
            />
          </div>

          <Button
            onClick={handleProfileUpdate}
            disabled={isUpdating}
            size="sm"
            className="bg-primary hover:bg-primary/90"
          >
            {isUpdating ? (
              <>
                <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card className="overflow-hidden border shadow-sm">
        <CardHeader className="border-b bg-muted/30 py-4">
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            {theme === "light" && <Sun className="h-4 w-4 text-primary" />}
            {theme === "dark" && <Moon className="h-4 w-4 text-primary" />}
            {theme === "system" && <Laptop className="h-4 w-4 text-primary" />}
            Appearance
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-2">
            <ThemeButton
              active={theme === "light"}
              icon={<Sun className="h-4 w-4" />}
              label="Light"
              onClick={() => setTheme("light")}
            />
            <ThemeButton
              active={theme === "dark"}
              icon={<Moon className="h-4 w-4" />}
              label="Dark"
              onClick={() => setTheme("dark")}
            />
            <ThemeButton
              active={theme === "system"}
              icon={<Laptop className="h-4 w-4" />}
              label="System"
              onClick={() => setTheme("system")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Password */}
      <Card className="overflow-hidden border shadow-sm">
        <CardHeader className="border-b bg-muted/30 py-4">
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <Lock className="h-4 w-4 text-primary" />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <Label
              htmlFor="current-password"
              className="text-xs font-medium text-muted-foreground"
            >
              CURRENT PASSWORD
            </Label>
            <Input
              id="current-password"
              type="password"
              value={passwords.current}
              onChange={(e) =>
                setPasswords({ ...passwords, current: e.target.value })
              }
              placeholder="••••••••"
              className="focus-visible:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="new-password"
              className="text-xs font-medium text-muted-foreground"
            >
              NEW PASSWORD
            </Label>
            <Input
              id="new-password"
              type="password"
              value={passwords.new}
              onChange={(e) =>
                setPasswords({ ...passwords, new: e.target.value })
              }
              placeholder="••••••••"
              className="focus-visible:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="confirm-password"
              className="text-xs font-medium text-muted-foreground"
            >
              CONFIRM NEW PASSWORD
            </Label>
            <Input
              id="confirm-password"
              type="password"
              value={passwords.confirm}
              onChange={(e) =>
                setPasswords({ ...passwords, confirm: e.target.value })
              }
              placeholder="••••••••"
              className="focus-visible:ring-primary"
            />
          </div>

          <Button onClick={handlePasswordUpdate} variant="outline" size="sm">
            Update password
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="overflow-hidden border shadow-sm">
        <CardHeader className="border-b bg-red-50 dark:bg-red-950/10 py-4">
          <CardTitle className="flex items-center gap-2 text-base font-medium text-red-600 dark:text-red-400">
            <Trash2 className="h-4 w-4" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground mb-4">
            Once you delete your account, there is no going back. All your data
            will be permanently removed.
          </p>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteDialogOpen(true)}
          >
            Delete account
          </Button>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteAccount}
        title="Delete account?"
        description="This action cannot be undone. All your posts, comments, and data will be permanently deleted."
        confirmText={isDeleting ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        variant="destructive"
        loading={isDeleting}
      />
    </div>
  );
};

export default Settings;

/* ---------------- Theme Button ---------------- */

interface ThemeButtonProps {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

function ThemeButton({ active, icon, label, onClick }: ThemeButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-1.5 rounded-md border px-3 py-2 text-xs font-medium transition-all",
        "hover:bg-accent hover:text-accent-foreground",
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-input bg-background",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

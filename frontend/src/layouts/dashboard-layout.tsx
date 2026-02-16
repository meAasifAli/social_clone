import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { UserPlus, X } from "lucide-react";
import { toast } from "sonner";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { NotificationDropdown } from "@/components/shared/notifications-dropdown";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { useGetSuggestionsQuery } from "@/store/apis/user-api";
import { useFollowUserMutation } from "@/store/apis/user-api";
import { socketService } from "@/services/socket.service";
import { setConnectionStatus } from "@/store/slices/notification.slice";
import { DashboardSidebar } from "@/components/shared/sidebar";

/* ---------------- Helpers ---------------- */

const getInitials = (name?: string) => {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0]?.toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

/* ---------------- Suggestions Skeleton ---------------- */

const SuggestionsSkeleton = () => {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <Skeleton className="h-8 w-16 rounded-md" />
        </div>
      ))}
    </div>
  );
};

/* ---------------- Suggestions Component ---------------- */

const SuggestionsPanel = () => {
  const navigate = useNavigate();
  const authUser = useAppSelector((s) => s.auth.user);
  const currentUserId = authUser?.id;

  const {
    data: suggestions,
    isLoading,
    isError,
    refetch,
  } = useGetSuggestionsQuery(undefined, {
    skip: !currentUserId,
    refetchOnMountOrArgChange: true,
  });

  const [followUser, { isLoading: isFollowing }] = useFollowUserMutation();

  const handleFollow = async (userId: string, username: string) => {
    try {
      await followUser(userId).unwrap();
      toast.success(`Following @${username}`);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to follow user");
    }
  };

  const handleProfileClick = (userId: string) => {
    navigate(`/dashboard/profile/${userId}`);
  };

  const handleDismiss = (userId: string) => {
    console.log("Dismiss suggestion:", userId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Suggestions for you</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => refetch()}
          className="text-xs"
        >
          Refresh
        </Button>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <SuggestionsSkeleton />
        ) : isError ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground mb-4">
              Failed to load suggestions
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Try again
            </Button>
          </div>
        ) : !suggestions?.length ? (
          <div className="text-center py-8">
            <UserPlus className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              No suggestions right now
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Check back later!
            </p>
          </div>
        ) : (
          suggestions.map((user) => (
            <Card
              key={user.id}
              className="p-3 border-0 shadow-none hover:bg-muted/50 transition cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div
                  className="flex items-center gap-3 flex-1"
                  onClick={() => handleProfileClick(user.id)}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar || ""} />
                    <AvatarFallback>
                      {getInitials(user.fullName || user.username)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {user.fullName || user.username}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      @{user.username}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 px-3"
                    onClick={() => handleFollow(user.id, user.username)}
                    disabled={isFollowing}
                  >
                    <UserPlus className="h-3.5 w-3.5 mr-1" />
                    Follow
                  </Button>

                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => handleDismiss(user.id)}
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              </div>

              {user?.mutualFollowersCount && user?.mutualFollowersCount > 0 && (
                <div className="mt-2 text-xs text-muted-foreground">
                  Followed by {user.mutualFollowersCount}{" "}
                  {user.mutualFollowersCount === 1 ? "person" : "people"} you
                  follow
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      <div className="pt-4 border-t">
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <a href="#" className="hover:underline">
            About
          </a>
          <a href="#" className="hover:underline">
            Help
          </a>
          <a href="#" className="hover:underline">
            Terms
          </a>
          <a href="#" className="hover:underline">
            Privacy
          </a>
          <span>© 2026</span>
        </div>
      </div>
    </div>
  );
};

/* ---------------- Main Layout ---------------- */

const DashboardLayout = () => {
  const dispatch = useAppDispatch();
  const { accessToken, user } = useAppSelector((state) => state.auth);
  const { isConnected } = useAppSelector((state) => state.notifications);

  useEffect(() => {
    if (!accessToken || !user) return;

    socketService.connect(accessToken);

    const unsubscribeConnected = socketService.on("connected:confirmed", () => {
      dispatch(setConnectionStatus(true));
    });

    const unsubscribeDisconnected = socketService.on("connection:lost", () => {
      dispatch(setConnectionStatus(false));
    });

    return () => {
      unsubscribeConnected();
      unsubscribeDisconnected();
      socketService.disconnect();
      dispatch(setConnectionStatus(false));
    };
  }, [accessToken, user, dispatch]);

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        {/* Sidebar */}
        <DashboardSidebar />

        {/* Main Content Area */}
        <SidebarInset className="flex flex-col w-full">
          {/* Header */}
          <DashboardHeader>
            <div className="flex items-center gap-2 ml-auto">
              {!isConnected && (
                <Badge
                  variant="outline"
                  className="bg-yellow-50 text-yellow-700 border-yellow-200 animate-pulse"
                >
                  Connecting...
                </Badge>
              )}
              <NotificationDropdown />
            </div>
          </DashboardHeader>

          {/* Scrollable Feed Area */}
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-2xl mx-auto px-4 py-6">
              <Outlet />
            </div>
          </main>
        </SidebarInset>

        {/* Right Panel - Suggestions */}
        <aside className="hidden lg:block w-96 border-l overflow-y-auto">
          <div className="p-6">
            <SuggestionsPanel />
          </div>
        </aside>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;

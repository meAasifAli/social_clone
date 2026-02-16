import { useState } from "react";
import {
  Heart,
  MessageCircle,
  UserPlus,
  Repeat,
  Bell,
  CheckCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  useGetNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
} from "@/store/apis/notifications-api";
import { markAsRead as markAsReadLocally } from "@/store/slices/notification.slice";

const iconMap = {
  like: Heart,
  comment: MessageCircle,
  follow: UserPlus,
  repost: Repeat,
  mention: Bell,
};

const Activity = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState("all");
  const [page, setPage] = useState(1);

  const { unreadCount, isConnected } = useAppSelector(
    (state) => state.notifications,
  );

  const { data, isLoading, isFetching } = useGetNotificationsQuery({
    page,
    limit: 20,
  });

  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();

  const notifications = data?.data || [];
  const totalPages = data?.meta?.totalPages || 1;

  const handleNotificationClick = async (notification: any) => {
    if (!notification.read) {
      await markAsRead(notification.id);
      dispatch(markAsReadLocally(notification.id));
    }

    // Navigate based on notification type
    switch (notification.type) {
      case "like":
      case "comment":
      case "repost":
        if (notification.data?.postId) {
          navigate(`/dashboard/post/${notification.data.postId}`);
        }
        break;
      case "follow":
        navigate(`/dashboard/profile/${notification.actor?.id}`);
        break;
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const filteredNotifications =
    activeTab === "all"
      ? notifications
      : notifications.filter((n) => n.type === activeTab);

  const getNotificationText = (notification: any) => {
    const actorName = notification.actor?.name || "Someone";

    switch (notification.type) {
      case "like":
        return `${actorName} liked your post`;
      case "comment":
        return `${actorName} commented: "${notification.data?.commentContent || ""}"`;
      case "follow":
        return `${actorName} started following you`;
      case "repost":
        return `${actorName} reposted your post`;
      case "mention":
        return `${actorName} mentioned you`;
      default:
        return `New notification from ${actorName}`;
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold">Activity</h1>
          {isConnected && (
            <span className="flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
            className="gap-2"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all as read
          </Button>
        )}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Notifications</CardTitle>
            <span className="text-sm text-muted-foreground">
              {unreadCount} unread
            </span>
          </div>
          <Tabs
            defaultValue="all"
            className="mt-2"
            onValueChange={setActiveTab}
          >
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="like" className="gap-1">
                <Heart className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Likes</span>
              </TabsTrigger>
              <TabsTrigger value="comment" className="gap-1">
                <MessageCircle className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Comments</span>
              </TabsTrigger>
              <TabsTrigger value="follow" className="gap-1">
                <UserPlus className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Follows</span>
              </TabsTrigger>
              <TabsTrigger value="repost" className="gap-1">
                <Repeat className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Reposts</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-0">
              <CardContent className="space-y-4 pt-4">
                {isLoading && page === 1 ? (
                  // Loading skeletons
                  [...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-full" />
                      </div>
                    </div>
                  ))
                ) : filteredNotifications.length === 0 ? (
                  // Empty state
                  <div className="text-center py-12 text-muted-foreground">
                    <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No notifications yet</p>
                    <p className="text-xs mt-1">
                      When you get notifications, they'll appear here
                    </p>
                  </div>
                ) : (
                  // Notifications list
                  filteredNotifications.map((notification) => {
                    const Icon =
                      iconMap[notification.type as keyof typeof iconMap] ||
                      Bell;

                    return (
                      <div
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={cn(
                          "flex items-start gap-3 rounded-md p-3 transition cursor-pointer",
                          "hover:bg-muted/80",
                          !notification.read && "bg-muted",
                        )}
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={notification.actor?.avatar} />
                          <AvatarFallback>
                            {notification.actor?.name?.[0]?.toUpperCase() ||
                              "U"}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 text-sm">
                          <span className="font-medium mr-1">
                            {notification.actor?.name}
                          </span>
                          {getNotificationText(notification)}
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(
                                new Date(notification.createdAt),
                                { addSuffix: true },
                              )}
                            </span>
                            {!notification.read && (
                              <span className="h-2 w-2 rounded-full bg-blue-500" />
                            )}
                          </div>
                        </div>

                        <Icon className="h-4 w-4 text-muted-foreground mt-1" />
                      </div>
                    );
                  })
                )}

                {/* Load more */}
                {!isLoading && page < totalPages && (
                  <Button
                    variant="ghost"
                    className="w-full mt-4"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={isFetching}
                  >
                    {isFetching ? "Loading..." : "Load more"}
                  </Button>
                )}
              </CardContent>
            </TabsContent>
          </Tabs>
        </CardHeader>
      </Card>
    </div>
  );
};

export default Activity;

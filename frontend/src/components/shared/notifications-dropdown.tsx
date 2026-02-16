import { useState } from "react";
import {
  Bell,
  Heart,
  MessageCircle,
  UserPlus,
  Repeat,
  Check,
  CheckCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  useGetNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
} from "@/store/apis/notifications-api";
import { markAsRead as markAsReadLocally } from "@/store/slices/notification.slice";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "like":
      return <Heart className="h-4 w-4 text-red-500" />;
    case "comment":
      return <MessageCircle className="h-4 w-4 text-blue-500" />;
    case "follow":
      return <UserPlus className="h-4 w-4 text-green-500" />;
    case "repost":
      return <Repeat className="h-4 w-4 text-purple-500" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
};

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
    default:
      return `New notification from ${actorName}`;
  }
};

export const NotificationDropdown = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { unreadCount, isConnected } = useAppSelector(
    (state) => state.notifications,
  );

  const { data, isLoading } = useGetNotificationsQuery(
    { page: 1, limit: 10 },
    { skip: !open },
  );

  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();

  const handleNotificationClick = async (notification: any) => {
    if (!notification.read) {
      await markAsRead(notification.id);
      dispatch(markAsReadLocally(notification.id));
    }

    // Navigate based on notification type
    if (
      notification.type === "like" ||
      notification.type === "comment" ||
      notification.type === "repost"
    ) {
      if (notification.data?.postId) {
        navigate(`/dashboard/post/${notification.data.postId}`);
      }
    } else if (notification.type === "follow") {
      navigate(`/dashboard/profile/${notification.actor?.id}`);
    }

    setOpen(false);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    setOpen(false);
  };

  const handleViewAll = () => {
    navigate("/dashboard/notifications");
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-xs text-white flex items-center justify-center animate-pulse">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
          {!isConnected && (
            <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-yellow-500" />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">Notifications</h3>
            {isConnected && (
              <span className="flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-xs h-7"
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        <ScrollArea className="h-100">
          {isLoading ? (
            <div className="p-4 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : data?.data.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className="space-y-1">
              {data?.data.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    "w-full flex items-start gap-3 p-3 hover:bg-muted transition text-left",
                    !notification.read && "bg-muted/50",
                  )}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={notification.actor?.avatar} />
                    <AvatarFallback>
                      {notification.actor?.name?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="font-semibold text-sm">
                          {notification.actor?.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {getNotificationIcon(notification.type)}
                        </span>
                      </div>
                      {notification.read ? (
                        <Check className="h-3 w-3 text-muted-foreground" />
                      ) : (
                        <span className="h-2 w-2 rounded-full bg-blue-500" />
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {getNotificationText(notification)}
                    </p>

                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="p-2 text-center border-t">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs w-full"
            onClick={handleViewAll}
          >
            View all notifications
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

"use client";

import { Heart, MessageCircle, UserPlus } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface ActivityItem {
  id: number;
  type: "like" | "comment" | "follow";
  user: {
    name: string;
    username: string;
    avatar: string;
  };
  message: string;
  time: string;
  unread?: boolean;
}

const activities: ActivityItem[] = [
  {
    id: 1,
    type: "like",
    user: {
      name: "Jane Doe",
      username: "janedoe",
      avatar: "https://i.pravatar.cc/150?img=32",
    },
    message: "liked your post",
    time: "2m ago",
    unread: true,
  },
  {
    id: 2,
    type: "comment",
    user: {
      name: "Alex",
      username: "alexdev",
      avatar: "https://i.pravatar.cc/150?img=45",
    },
    message: "commented: Looks great 🔥",
    time: "1h ago",
  },
  {
    id: 3,
    type: "follow",
    user: {
      name: "Sarah",
      username: "sarah.ui",
      avatar: "https://i.pravatar.cc/150?img=18",
    },
    message: "started following you",
    time: "Yesterday",
  },
];

const iconMap = {
  like: Heart,
  comment: MessageCircle,
  follow: UserPlus,
};

const Activity = () => {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Activity</h1>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {activities.map((item) => {
            const Icon = iconMap[item.type];

            return (
              <div
                key={item.id}
                className={cn(
                  "flex items-start gap-3 rounded-md p-3 transition",
                  item.unread && "bg-muted"
                )}
              >
                <Avatar>
                  <AvatarImage src={item.user.avatar} />
                  <AvatarFallback>{item.user.name.charAt(0)}</AvatarFallback>
                </Avatar>

                <div className="flex-1 text-sm">
                  <span className="font-medium mr-1">{item.user.username}</span>
                  {item.message}
                  <div className="text-xs text-muted-foreground">
                    {item.time}
                  </div>
                </div>

                <Icon className="h-4 w-4 text-muted-foreground mt-1" />
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default Activity;

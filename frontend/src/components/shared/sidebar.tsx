import { NavLink, useNavigate } from "react-router-dom";
import {
  Home,
  Search,
  PlusSquare,
  Heart,
  User,
  Settings,
  LogOut,
  MessageCircle,
} from "lucide-react";

import Logo from "@/components/shared/logo";
import { cn } from "@/lib/utils";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout as logoutAction } from "@/store/slices/auth.slice";
import { useLogoutMutation } from "@/store/apis/auth-api";
import { useGetUserByIdQuery } from "@/store/apis/user-api";
import { useGetConversationsQuery, useSyncOnlineUsersQuery } from "@/store/apis/message-api";

/* ---------------- Navigation ---------------- */

const navItems = [
  { label: "Feed", icon: Home, to: "/dashboard/feed" },
  { label: "Search", icon: Search, to: "/dashboard/search" },
  { label: "Create", icon: PlusSquare, to: "/dashboard/create" },
  { label: "Messages", icon: MessageCircle, to: "/dashboard/messages" },
  { label: "Activity", icon: Heart, to: "/dashboard/activity" },
  { label: "Profile", icon: User, to: "/dashboard/profile" },
];

const FILLED_ICONS = ["Home", "Activity", "Profile", "Messages"];

/* ---------------- Helper ---------------- */

const getInitials = (name?: string) => {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0]?.toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

/* ---------------- Component ---------------- */

export const DashboardSidebar = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { state } = useSidebar();
  const { user: authUser, refreshToken } = useAppSelector((s) => s.auth);
  const userId = authUser?.id;

  const [logoutApi] = useLogoutMutation();

  const { data: user } = useGetUserByIdQuery(userId!, {
    skip: !userId,
  });

  const { data: conversations } = useGetConversationsQuery(undefined, { skip: !userId });
  useSyncOnlineUsersQuery(undefined, { skip: !userId });

  const unreadMessagesCount = Array.isArray(conversations) 
    ? conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0) 
    : 0;

  const displayName =
    user?.fullName ||
    user?.username ||
    authUser?.email?.split("@")[0] ||
    "User";
  const username = user?.username || authUser?.email?.split("@")[0] || "user";
  const avatarUrl = user?.avatar || "";
  const userInitials = getInitials(displayName);

  const profileUrl = userId
    ? `/dashboard/profile/${userId}`
    : "/dashboard/profile";

  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" variant="sidebar" className="border-r">
      <SidebarHeader className="p-0">
        <div
          className={cn(
            "flex h-16 items-center",
            collapsed ? "justify-center px-2" : "px-6",
          )}
        >
          <Logo showText={!collapsed} />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-2">
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const itemTo = item.label === "Profile" ? profileUrl : item.to;

            return (
              <NavLink
                key={item.label}
                to={itemTo}
                className={({ isActive }) =>
                  cn(
                    "group relative flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    "hover:bg-accent/50 hover:text-accent-foreground",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground",
                    collapsed ? "justify-center px-2" : "gap-3",
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && !collapsed && (
                      <div className="absolute left-0 top-1/2 -mt-4 h-8 w-1 rounded-r-full bg-primary" />
                    )}
                    <Icon
                      className={cn(
                        "h-5 w-5 shrink-0 transition-transform duration-200",
                        isActive ? "scale-110 text-primary" : "group-hover:scale-110 group-hover:text-foreground",
                      )}
                      {...(isActive && FILLED_ICONS.includes(item.label)
                        ? { fill: "currentColor", stroke: "none" }
                        : {})}
                    />

                    {!collapsed && (
                      <span
                        className={cn(
                          "transition-colors",
                          isActive ? "font-semibold bg-gradient-to-br from-primary to-primary/70 bg-clip-text text-transparent" : "",
                        )}
                      >
                        {item.label}
                      </span>
                    )}
                    
                    {item.label === "Messages" && unreadMessagesCount > 0 && (
                      <span
                        className={cn(
                          "absolute flex items-center justify-center rounded-full bg-primary font-medium text-primary-foreground",
                          collapsed 
                            ? "top-1 right-1 h-4 w-4 text-[9px]" 
                            : "right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[10px]"
                        )}
                      >
                        {unreadMessagesCount > 99 ? "99+" : unreadMessagesCount}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </SidebarContent>

      <SidebarFooter className="border-t p-0 mt-auto">
        <div className={cn("p-4", collapsed && "px-2")}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "flex w-full items-center rounded-md transition hover:bg-muted",
                  collapsed ? "justify-center p-2" : "gap-3 px-3 py-2",
                )}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={avatarUrl} />
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>

                {!collapsed && (
                  <div className="flex flex-col items-start text-sm leading-tight">
                    <span className="font-medium truncate max-w-30">
                      {displayName}
                    </span>
                    <span className="text-xs text-muted-foreground truncate max-w-30">
                      @{username}
                    </span>
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <NavLink to={profileUrl} className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Profile
                </NavLink>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <NavLink
                  to="/dashboard/settings"
                  className="flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </NavLink>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                className="flex items-center gap-2 text-red-600 cursor-pointer"
                onClick={async () => {
                  try {
                    if (refreshToken) {
                      await logoutApi({ refreshToken }).unwrap();
                    }
                  } catch (error) {
                    console.error("Logout error:", error);
                  } finally {
                    dispatch(logoutAction());
                    navigate("/auth/login", { replace: true });
                  }
                }}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

import { NavLink, useNavigate } from "react-router-dom";
import {
  Home,
  Search,
  PlusSquare,
  Heart,
  User,
  Settings,
  LogOut,
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

/* ---------------- Navigation ---------------- */

const navItems = [
  { label: "Feed", icon: Home, to: "/dashboard/feed" },
  { label: "Search", icon: Search, to: "/dashboard/search" },
  { label: "Create", icon: PlusSquare, to: "/dashboard/create" },
  { label: "Activity", icon: Heart, to: "/dashboard/activity" },
  { label: "Profile", icon: User, to: "/dashboard/profile" },
];

const FILLED_ICONS = ["Home", "Activity", "Profile"];

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
                    "flex items-center rounded-md px-3 py-2 text-sm transition-all",
                    "hover:bg-muted",
                    isActive && "bg-muted font-semibold",
                    collapsed ? "justify-center px-2" : "gap-3",
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={cn(
                        "h-5 w-5 shrink-0 transition",
                        isActive && "scale-105",
                      )}
                      {...(isActive && FILLED_ICONS.includes(item.label)
                        ? { fill: "currentColor", stroke: "none" }
                        : {})}
                    />

                    {!collapsed && (
                      <span
                        className={cn(
                          "transition",
                          isActive && "font-semibold",
                        )}
                      >
                        {item.label}
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

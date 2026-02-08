import { NavLink } from "react-router-dom";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout as logoutAction } from "@/store/slices/auth.slice";
import { useLogoutMutation } from "@/store/apis/auth-api";

/* ---------------- Navigation ---------------- */

const navItems = [
  { label: "Feed", icon: Home, to: "/dashboard/feed" },
  { label: "Search", icon: Search, to: "/dashboard/search" },
  { label: "Create", icon: PlusSquare, to: "/dashboard/create" },
  { label: "Activity", icon: Heart, to: "/dashboard/activity" },
  { label: "Profile", icon: User, to: "/dashboard/profile" },
];

/* ---------------- Props ---------------- */

interface DashboardSidebarProps {
  collapsed: boolean;
}
const FILLED_ICONS = ["Home", "Activity", "Profile"];

/* ---------------- Component ---------------- */

export const DashboardSidebar = ({ collapsed }: DashboardSidebarProps) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { refreshToken } = useAppSelector((s) => s.auth);

  const [logoutApi] = useLogoutMutation();

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r bg-background transition-all duration-300",
        collapsed ? "w-16 px-2 py-4" : "w-64 px-6 py-6",
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "mb-8 flex",
          collapsed ? "justify-center" : "justify-start",
        )}
      >
        <Logo showText={!collapsed} />
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center rounded-md px-3 py-2 text-sm transition",
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
                      className={cn("transition", isActive && "font-semibold")}
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

      {/* Divider */}
      <div className="mt-4 border-t pt-4" />

      {/* User Profile Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              "flex w-full items-center rounded-md transition hover:bg-muted",
              collapsed ? "justify-center p-2" : "gap-3 px-3 py-2",
            )}
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src="https://i.pravatar.cc/150?img=12" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>

            {!collapsed && (
              <div className="flex flex-col items-start text-sm leading-tight">
                <span className="font-medium">John Doe</span>
                <span className="text-xs text-muted-foreground">@johndoe</span>
              </div>
            )}
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem asChild>
            <NavLink
              to="/dashboard/profile"
              className="flex items-center gap-2"
            >
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
            className="flex items-center gap-2 text-red-600"
            onClick={async () => {
              try {
                if (refreshToken) {
                  await logoutApi({ refreshToken }).unwrap();
                }
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
    </aside>
  );
};

import { useLocation, Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface DashboardHeaderProps {
  children?: React.ReactNode;
}

export const DashboardHeader = ({ children }: DashboardHeaderProps) => {
  const location = useLocation();

  const segments = location.pathname
    .replace("/dashboard", "")
    .split("/")
    .filter(Boolean);

  const getPageTitle = (segment: string) => {
    return segment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 gap-4">
        <SidebarTrigger className="hidden md:flex shrink-0 aspect-square w-9 h-9 items-center justify-center rounded-lg hover:bg-muted" />

      {/* Breadcrumbs - Hidden on mobile */}
      <div className="hidden md:block">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  to="/dashboard"
                  className="hover:text-foreground transition"
                >
                  Home
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>

            {segments.map((segment, index) => {
              const path = `/dashboard/${segments.slice(0, index + 1).join("/")}`;
              const isLast = index === segments.length - 1;

              return (
                <BreadcrumbItem key={path}>
                  <BreadcrumbSeparator />
                  <BreadcrumbLink asChild>
                    {isLast ? (
                      <span className="font-medium text-foreground">
                        {getPageTitle(segment)}
                      </span>
                    ) : (
                      <Link
                        to={path}
                        className="hover:text-foreground transition"
                      >
                        {getPageTitle(segment)}
                      </Link>
                    )}
                  </BreadcrumbLink>
                </BreadcrumbItem>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Mobile Page Title */}
      <div className="md:hidden flex-1">
        <h1 className="font-semibold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
          {segments.length > 0
            ? getPageTitle(segments[segments.length - 1])
            : "Home"}
        </h1>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {children}
      </div>
    </div>
  </header>
  );
};

import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";

export const PublicRoute = () => {
  const isAuth = useAppSelector((s) => s.auth.isAuthenticated);
  return isAuth ? <Navigate to="/dashboard/feed" replace /> : <Outlet />;
};

import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";

export const ProtectedRoute = () => {
  const isAuth = useAppSelector((s) => s.auth.isAuthenticated);
  return isAuth ? <Outlet /> : <Navigate to="/auth/login" replace />;
};

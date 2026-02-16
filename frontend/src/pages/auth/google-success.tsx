import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/store/slices/auth.slice";
import { toast } from "sonner";

const GoogleSuccess = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const accessToken = params.get("accessToken");
    const userParam = params.get("user");

    if (!accessToken || !userParam) {
      toast.error("Google login failed. Missing token.");
      navigate("/auth/login", { replace: true });
      return;
    }

    try {
      const user = JSON.parse(decodeURIComponent(userParam));

      dispatch(
        setCredentials({
          accessToken,
          user,
        }),
      );

      toast.success("Signed in successfully");
      navigate("/dashboard/feed", { replace: true });
    } catch {
      toast.error("Google login failed. Invalid user data.");
      navigate("/auth/login", { replace: true });
    }
  }, [dispatch, navigate, params]);

  return (
    <div className="flex h-screen items-center justify-center text-sm text-muted-foreground">
      Signing you in with Google…
    </div>
  );
};

export default GoogleSuccess;

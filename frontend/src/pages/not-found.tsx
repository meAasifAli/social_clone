import { useNavigate } from "react-router-dom";
import { Home, ArrowLeft, Frown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const NotFound = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate("/dashboard/feed");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="max-w-md w-full p-8 text-center space-y-6">
        {/* Animated 404 */}
        <div className="relative">
          <h1 className="text-8xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            404
          </h1>
          <Frown className="h-12 w-12 text-muted-foreground absolute -top-2 -right-2 animate-bounce" />
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Page Not Found</h2>
          <p className="text-muted-foreground">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            variant="outline"
            onClick={handleGoBack}
            className="flex-1 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
          <Button
            onClick={handleGoHome}
            className="flex-1 gap-2 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Home className="h-4 w-4" />
            Go Home
          </Button>
        </div>

        {/* Helpful Links */}
        <div className="pt-4 text-xs text-muted-foreground">
          <p>Popular pages:</p>
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            <button
              onClick={() => navigate("/dashboard/feed")}
              className="hover:text-foreground hover:underline transition"
            >
              Feed
            </button>
            <button
              onClick={() => navigate("/dashboard/profile")}
              className="hover:text-foreground hover:underline transition"
            >
              Profile
            </button>
            <button
              onClick={() => navigate("/dashboard/search")}
              className="hover:text-foreground hover:underline transition"
            >
              Search
            </button>
            <button
              onClick={() => navigate("/dashboard/activity")}
              className="hover:text-foreground hover:underline transition"
            >
              Activity
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default NotFound;

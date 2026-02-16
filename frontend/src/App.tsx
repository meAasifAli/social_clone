import { Route, Routes } from "react-router-dom";

import Signup from "./pages/auth/signup";
import Login from "./pages/auth/login";
import VerifyAccount from "./pages/auth/verify-account";
import AuthLayout from "./layouts/auth-layout";
import ForgotPassword from "./pages/auth/forgot-password";
import ResetPassword from "./pages/auth/reset-password";
import DashboardLayout from "./layouts/dashboard-layout";

import Profile from "./pages/dashboard/profile";
import CreatePosts from "./pages/dashboard/create-posts";
import Search from "./pages/dashboard/search";
import Activity from "./pages/dashboard/activity";
import Feed from "./pages/dashboard/feed";
import Settings from "./pages/dashboard/settings";
import { PublicRoute } from "./pages/general/public-route";
import { ProtectedRoute } from "./pages/general/protected-route";
import GoogleSuccess from "./pages/auth/google-success";
import Post from "./pages/dashboard/post";
import NotFound from "./pages/not-found";
import Home from "./pages";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="*" element={<NotFound />} />
      <Route path="/auth/google-success" element={<GoogleSuccess />} />
      <Route path="reset-password" element={<ResetPassword />} />
      {/* PUBLIC AUTH ROUTES */}
      <Route element={<PublicRoute />}>
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="signup" element={<Signup />} />
          <Route path="login" element={<Login />} />
          <Route path="verify" element={<VerifyAccount />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
        </Route>
      </Route>

      {/* PROTECTED DASHBOARD ROUTES */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route path="feed" element={<Feed />} />
          <Route path="post/:postId" element={<Post />} />
          <Route path="profile/:userId" element={<Profile />} />
          <Route path="create" element={<CreatePosts />} />
          <Route path="search" element={<Search />} />
          <Route path="activity" element={<Activity />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default App;

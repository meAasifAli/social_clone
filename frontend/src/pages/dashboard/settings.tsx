"use client";

import { useTheme } from "@/hooks/useTheme";
import { Moon, Sun, Laptop } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const Settings = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="text-2xl font-semibold">Settings</h1>

      {/* Account */}
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Username</Label>
            <Input defaultValue="johndoe" />
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input defaultValue="john@example.com" />
          </div>

          <Button>Save changes</Button>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <Label>Theme</Label>

          <div className="grid grid-cols-3 gap-3">
            <ThemeButton
              active={theme === "light"}
              icon={<Sun className="h-4 w-4" />}
              label="Light"
              onClick={() => setTheme("light")}
            />

            <ThemeButton
              active={theme === "dark"}
              icon={<Moon className="h-4 w-4" />}
              label="Dark"
              onClick={() => setTheme("dark")}
            />

            <ThemeButton
              active={theme === "system"}
              icon={<Laptop className="h-4 w-4" />}
              label="System"
              onClick={() => setTheme("system")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Password */}
      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Current password</Label>
            <Input type="password" />
          </div>

          <div className="space-y-2">
            <Label>New password</Label>
            <Input type="password" />
          </div>

          <Button>Update password</Button>
        </CardContent>
      </Card>

      {/* Danger */}
      <Card className="border-red-500/50">
        <CardHeader>
          <CardTitle className="text-red-600">Danger zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Separator />
          <Button variant="destructive">Delete account</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;

/* ---------------- Theme Button ---------------- */

interface ThemeButtonProps {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

function ThemeButton({ active, icon, label, onClick }: ThemeButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-md border px-4 py-3 text-sm transition",
        active ? "border-primary bg-primary/10 text-primary" : "hover:bg-muted"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

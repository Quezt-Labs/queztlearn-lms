"use client";

import Link from "next/link";
import Image from "next/image";
import { Bell, LogOut, User, Sun, Moon, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/components/providers/theme-provider";
import { useOrgLogo, useOrgName } from "@/lib/store/organization-config";
import { tokenManager } from "@/lib/api/client";

export function StudentHeader() {
  const orgLogo = useOrgLogo();
  const orgName = useOrgName();
  const user = tokenManager.getUser();
  const { theme, setTheme } = useTheme();

  const isDark = theme === "dark";

  return (
    <header className="md:mx-6 sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container flex h-16 items-center px-4 gap-4">
        {/* Logo and Organization Name */}
        <Link href="/student/my-learning" className="flex items-center gap-3">
          {orgLogo && (
            <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-primary/10">
              <Image
                src={orgLogo}
                alt={orgName}
                fill
                className="object-contain p-1"
              />
            </div>
          )}
          <div className="hidden md:block">
            <h1 className="text-lg font-bold">
              {orgName || "Learning Platform"}
            </h1>
            <p className="text-xs text-muted-foreground">Student Portal</p>
          </div>
        </Link>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Theme Toggle */}
        <div className="flex items-center space-x-2">
          <Sun className="h-4 w-4 text-muted-foreground" />
          <Switch
            checked={isDark}
            onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
          />
          <Moon className="h-4 w-4 text-muted-foreground" />
        </div>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="p-4 text-center text-sm text-muted-foreground">
              No notifications
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="" alt={user?.username || "User"} />
                <AvatarFallback className="bg-primary/10">
                  {user?.username?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <span className="ml-2 hidden md:inline-block text-sm">
                {user?.username || "Student"}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user?.username || "Student"}
                </p>
                {user?.email && (
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/student/profile">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/student/orders">
                <Receipt className="mr-2 h-4 w-4" />
                Orders
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => {
                tokenManager.clearAuthData();
                window.location.href = "/login";
              }}
            >
              <LogOut className="mr-2 h-4 w-4 text-destructive" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

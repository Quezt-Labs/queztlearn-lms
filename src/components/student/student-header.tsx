"use client";

import Link from "next/link";
import Image from "next/image";
import { Bell, LogOut, User } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { useOrgLogo, useOrgName } from "@/lib/store/organization-config";
import { tokenManager } from "@/lib/api/client";

export function StudentHeader() {
  const orgLogo = useOrgLogo();
  const orgName = useOrgName();
  const user = tokenManager.getUser();

  return (
    <header className="md:mx-6 sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container flex h-16 items-center px-4 gap-4">
        {/* Logo and Organization Name */}
        <Link href="/student/dashboard" className="flex items-center gap-3">
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

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                3
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">New assignment posted</p>
                <p className="text-xs text-muted-foreground">
                  Physics Chapter 5 - Due in 3 days
                </p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">Test reminder</p>
                <p className="text-xs text-muted-foreground">
                  Chemistry mock test tomorrow at 10 AM
                </p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">New video uploaded</p>
                <p className="text-xs text-muted-foreground">
                  Advanced Mathematics - Calculus Part 2
                </p>
              </div>
            </DropdownMenuItem>
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
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email || "student@example.com"}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/student/profile">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>

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

import { Film, Moon, Sun, LogIn, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "./ThemeProvider";
import { SearchBar } from "./SearchBar";
import type { User as UserType } from "@shared/schema";

interface NavigationProps {
  user?: UserType | null;
  isAuthenticated: boolean;
}

export function Navigation({ user, isAuthenticated }: NavigationProps) {
  const { theme, toggleTheme } = useTheme();

  const userInitials = user
    ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() ||
      user.email?.[0]?.toUpperCase() ||
      "U"
    : "";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <a
          href="/"
          className="flex items-center gap-2 shrink-0"
          data-testid="link-home"
        >
          <Film className="w-6 h-6 text-primary" />
          <span className="font-semibold text-lg hidden sm:block">
            KinoTracker
          </span>
        </a>

        {/* Search Bar - Centered */}
        <div className="flex-1 flex justify-center max-w-2xl">
          <SearchBar isAuthenticated={isAuthenticated} />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Theme Toggle */}
          <Button
            size="icon"
            variant="ghost"
            onClick={toggleTheme}
            data-testid="button-theme-toggle"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </Button>

          {/* Auth */}
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 rounded-full"
                  data-testid="button-user-menu"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={user.profileImageUrl || undefined}
                      alt={`${user.firstName || "User"}'s avatar`}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <a
                    href="/api/logout"
                    className="flex items-center gap-2 cursor-pointer"
                    data-testid="button-logout"
                  >
                    <LogOut className="w-4 h-4" />
                    Log out
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild data-testid="button-login">
              <a href="/api/login" className="gap-2">
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Log in</span>
              </a>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

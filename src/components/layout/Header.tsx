import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Lightbulb, User, LogOut, FolderOpen, ShoppingBag, Bot, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";

export function Header() {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const { user, signOut } = useAuth();
  const [hasBusiness, setHasBusiness] = useState(false);

  useEffect(() => {
    const checkBusiness = () => {
      const storedBusiness = sessionStorage.getItem("selectedBusiness");
      setHasBusiness(!!storedBusiness);
    };

    checkBusiness();
    // Listen for storage events in case it changes in another tab/window, 
    // though purely client-side nav won't trigger this for same-page. 
    // We mainly rely on mount.
    window.addEventListener('storage', checkBusiness);
    return () => window.removeEventListener('storage', checkBusiness);
  }, [location]); // Re-check on location change

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-transform group-hover:scale-105">
            <Lightbulb className="h-5 w-5" />
          </div>
          <span className="text-xl font-semibold tracking-tight">
            SmartBiz AI
          </span>
        </Link>

        <nav className="flex items-center gap-3">
          {!isHome && (
            <Link to="/">
              <Button variant="ghost" size="sm">
                Home
              </Button>
            </Link>
          )}

          {hasBusiness && (
            <Link to="/plan">
              <Button variant="ghost" size="sm" className="text-primary font-medium">
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
          )}

          <Link to="/marketplace">
            <Button variant="ghost" size="sm">
              <ShoppingBag className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Marketplace</span>
            </Button>
          </Link>

          <Link to="/ai-agent">
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10">
              <Bot className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline font-medium">Talk to AI</span>
            </Button>
          </Link>

          {user ? (
            <>
              <Link to="/saved-plans">
                <Button variant="ghost" size="sm">
                  <FolderOpen className="h-4 w-4 mr-2" />
                  Saved Plans
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline max-w-[100px] truncate">
                      {user.email?.split("@")[0]}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to="/saved-plans" className="cursor-pointer">
                      <FolderOpen className="h-4 w-4 mr-2" />
                      Saved Plans
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="cursor-pointer text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link to="/auth">
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </Link>
          )}

          <Link to="/start">
            <Button variant={isHome ? "hero" : "default"} size="sm">
              Get Started
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}

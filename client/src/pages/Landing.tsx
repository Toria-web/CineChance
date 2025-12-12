import { Film, Search, Check, Bookmark, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrendingGrid } from "@/components/TrendingGrid";

export default function Landing() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
        
        <div className="relative container mx-auto text-center max-w-3xl">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Film className="w-12 h-12 text-primary" />
            <h1 className="text-4xl sm:text-5xl font-bold">KinoTracker</h1>
          </div>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-xl mx-auto">
            Track movies and TV shows you've watched and create your personal watchlist. 
            Never forget what to watch next.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" asChild data-testid="button-hero-login">
              <a href="/api/login" className="gap-2">
                Get Started
                <ArrowRight className="w-4 h-4" />
              </a>
            </Button>
          </div>

          {/* Features */}
          <div className="grid sm:grid-cols-3 gap-6 text-left max-w-2xl mx-auto">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                <Search className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Search</h3>
                <p className="text-sm text-muted-foreground">
                  Find any movie or TV show from millions of titles
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                <Check className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Track Watched</h3>
                <p className="text-sm text-muted-foreground">
                  Keep a record of everything you've seen
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                <Bookmark className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Watchlist</h3>
                <p className="text-sm text-muted-foreground">
                  Save what you want to watch for later
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <h2 className="text-2xl font-semibold mb-6">Trending This Week</h2>
          <TrendingGrid isAuthenticated={false} />
        </div>
      </section>
    </div>
  );
}

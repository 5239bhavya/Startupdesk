import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, TrendingUp, Users, MapPin, IndianRupee, BarChart3 } from "lucide-react";

export function HeroSection() {
  const [hasBusiness, setHasBusiness] = useState(false);
  const [businessName, setBusinessName] = useState("");

  useEffect(() => {
    const storedBusiness = sessionStorage.getItem("selectedBusiness");
    if (storedBusiness) {
      const business = JSON.parse(storedBusiness);
      setHasBusiness(true);
      setBusinessName(business.name);
    }
  }, []);

  return (
    <section className="relative overflow-hidden gradient-hero">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />

      <div className="container relative py-20 lg:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-background/80 px-4 py-2 text-sm font-medium backdrop-blur-sm animate-fade-in">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>AI-Powered Business Planning</span>
          </div>

          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Start Your Business Journey
            <span className="block text-primary">with AI Guidance</span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground animate-slide-up" style={{ animationDelay: '0.2s' }}>
            Get personalized, step-by-step guidance to launch and grow your small business.
            From idea selection to marketing strategy — we've got you covered.
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center animate-slide-up" style={{ animationDelay: '0.3s' }}>
            {hasBusiness ? (
              <Link to="/plan">
                <Button variant="hero" size="xl" className="group">
                  Continue {businessName} Dashboard
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            ) : (
              <Link to="/start">
                <Button variant="hero" size="xl" className="group">
                  Start Your Business Journey
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            )}

            {!hasBusiness && (
              <Link to="/ai-agent">
                <Button variant="outline" size="xl" className="group backdrop-blur-sm bg-background/50">
                  <Sparkles className="mr-2 h-4 w-4 text-primary" />
                  Ask AI Advisor
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Feature Pills */}
        <div className="mt-16 flex flex-wrap justify-center gap-3 animate-fade-in" style={{ animationDelay: '0.5s' }}>
          {[
            { icon: IndianRupee, label: "Investment Planning" },
            { icon: TrendingUp, label: "Profit Estimation" },
            { icon: Users, label: "Workforce Guide" },
            { icon: MapPin, label: "Location Advice" },
            { icon: BarChart3, label: "Growth Roadmap" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 rounded-full bg-background/80 px-4 py-2 text-sm font-medium shadow-sm backdrop-blur-sm"
            >
              <Icon className="h-4 w-4 text-primary" />
              {label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

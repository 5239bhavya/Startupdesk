import { Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Sparkles, TrendingUp, Users, MapPin, IndianRupee, BarChart3, Zap, Target, Clock } from "lucide-react";

export function HeroSection() {
  const [hasBusiness, setHasBusiness] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const storedBusiness = sessionStorage.getItem("selectedBusiness");
    if (storedBusiness) {
      const business = JSON.parse(storedBusiness);
      setHasBusiness(true);
      setBusinessName(business.name);
    }
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setMousePosition({ x, y });
    };

    const hero = heroRef.current;
    if (hero) {
      hero.addEventListener('mousemove', handleMouseMove);
      return () => hero.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);

  const quickStats = [
    { icon: Zap, label: "5 Min Setup", value: "Fast Start", color: "text-warning" },
    { icon: Target, label: "AI-Powered", value: "Smart Plans", color: "text-primary" },
    { icon: Clock, label: "24/7 Support", value: "Always Here", color: "text-secondary" },
  ];

  return (
    <section ref={heroRef} className="relative overflow-hidden bg-background min-h-[95vh] flex items-center">
      {/* Animated gradient background */}
      <div className="absolute inset-0 gradient-hero opacity-60" />
      <div className="absolute inset-0 gradient-glow opacity-40" />

      {/* Enhanced mouse-tracking spotlight with color shift */}
      <div
        className="absolute inset-0 opacity-40 pointer-events-none transition-all duration-500 ease-out"
        style={{
          background: `radial-gradient(circle 800px at ${mousePosition.x}% ${mousePosition.y}%, rgba(124,92,255,0.25), rgba(13,202,240,0.15) 40%, transparent 70%)`
        }}
      />

      {/* Floating geometric shapes with enhanced parallax */}
      <div
        className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float transition-transform duration-300"
        style={{
          transform: `translate(${(mousePosition.x - 50) * 0.05}px, ${(mousePosition.y - 50) * 0.05}px) scale(${1 + (mousePosition.x - 50) * 0.001})`
        }}
      />
      <div
        className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float-delayed transition-transform duration-300"
        style={{
          transform: `translate(${(mousePosition.x - 50) * -0.04}px, ${(mousePosition.y - 50) * -0.04}px) scale(${1 + (50 - mousePosition.x) * 0.001})`
        }}
      />
      <div
        className="absolute top-1/2 left-1/2 w-64 h-64 bg-secondary/5 rounded-full blur-3xl animate-pulse"
        style={{
          transform: `translate(-50%, -50%) translate(${(mousePosition.x - 50) * 0.03}px, ${(mousePosition.y - 50) * 0.03}px)`
        }}
      />

      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_110%)]" />

      <div className="container relative py-20 lg:py-32">
        <div className="mx-auto max-w-5xl">
          {/* Badge */}
          <div className="text-center mb-8">
            <div
              className="inline-flex items-center gap-2 rounded-full glass px-5 py-2.5 text-sm font-medium animate-scale-bounce hover:scale-110 transition-all cursor-default shadow-glow-sm"
              style={{
                transform: `perspective(1000px) rotateX(${(mousePosition.y - 50) * 0.08}deg) rotateY(${(mousePosition.x - 50) * 0.08}deg)`,
                transition: 'transform 0.3s ease-out'
              }}
            >
              <Sparkles className="h-4 w-4 text-primary animate-pulse-glow" />
              <span>AI-Powered Business Planning</span>
            </div>
          </div>

          {/* Main heading */}
          <h1 className="mb-6 text-5xl font-extrabold leading-tight tracking-tight sm:text-6xl lg:text-7xl animate-blur-in text-center">
            <span className="block text-foreground">Launch Your</span>
            <span
              className="block gradient-text animate-gradient-shift mt-2"
              style={{
                transform: `translateY(${(mousePosition.y - 50) * 0.15}px)`,
                transition: 'transform 0.3s ease-out'
              }}
            >
              Dream Business
            </span>
          </h1>

          {/* Subheading */}
          <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground animate-slide-up text-center" style={{ animationDelay: '0.2s' }}>
            Get AI-powered, personalized guidance from idea to execution. Join thousands of entrepreneurs building successful businesses today.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center animate-slide-up mb-12" style={{ animationDelay: '0.4s' }}>
            {hasBusiness ? (
              <Link to="/plan">
                <Button variant="hero" size="xl" className="group shadow-glow-md">
                  Continue {businessName} Dashboard
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-2" />
                </Button>
              </Link>
            ) : (
              <Link to="/start">
                <Button variant="hero" size="xl" className="group shadow-glow-md">
                  Start Building Free
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-2" />
                </Button>
              </Link>
            )}

            {!hasBusiness && (
              <Link to="/ai-agent">
                <Button variant="glass" size="xl" className="group">
                  <Sparkles className="mr-2 h-4 w-4 text-primary group-hover:rotate-12 transition-transform" />
                  Ask AI Advisor
                </Button>
              </Link>
            )}
          </div>

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            {quickStats.map(({ icon: Icon, label, value, color }, index) => (
              <Card
                key={label}
                variant="glass"
                className="hover-lift cursor-default group"
                style={{
                  animationDelay: `${0.6 + index * 0.1}s`,
                  transform: `translateY(${Math.sin((mousePosition.x + index * 30) * 0.03) * 5}px)`,
                  transition: 'transform 0.3s ease-out'
                }}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`p-2 rounded-lg glass-subtle ${color} group-hover:scale-110 transition-transform`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">{label}</p>
                    <p className="text-sm font-bold">{value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-3 animate-fade-in" style={{ animationDelay: '0.7s' }}>
            {[
              { icon: IndianRupee, label: "Investment Planning" },
              { icon: TrendingUp, label: "Profit Estimation" },
              { icon: Users, label: "Workforce Guide" },
              { icon: MapPin, label: "Location Advice" },
              { icon: BarChart3, label: "Growth Roadmap" },
            ].map(({ icon: Icon, label }, index) => (
              <div
                key={label}
                className="flex items-center gap-2 rounded-full glass-subtle px-4 py-2 text-sm font-medium hover-scale cursor-default transition-all"
                style={{
                  animationDelay: `${0.8 + index * 0.1}s`,
                  transform: `translateY(${Math.sin((mousePosition.x + index * 25) * 0.025) * 4}px) rotateZ(${(mousePosition.x - 50) * 0.02}deg)`,
                  transition: 'transform 0.3s ease-out'
                }}
              >
                <Icon className="h-4 w-4 text-primary" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

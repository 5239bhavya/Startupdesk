import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-20 lg:py-28">
      <div className="container">
        <div className="relative overflow-hidden rounded-3xl gradient-primary p-8 md:p-16 animate-gradient-shift">
          {/* Animated background elements */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-background/10 via-transparent to-transparent" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-float-delayed" />

          <div className="relative mx-auto max-w-2xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full glass-subtle px-4 py-2 text-sm font-medium text-primary-foreground animate-scale-bounce">
              <Sparkles className="h-4 w-4 animate-pulse-glow" />
              <span>Start Your Journey Today</span>
            </div>

            <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl mb-4 animate-slide-up">
              Ready to Start Your Business?
            </h2>
            <p className="text-lg text-primary-foreground/90 mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Get your personalized AI-powered business plan in minutes.
              No guesswork, just practical guidance.
            </p>
            <div className="animate-scale-bounce" style={{ animationDelay: '0.2s' }}>
              <Link to="/start">
                <Button
                  size="xl"
                  className="bg-background text-foreground hover:bg-background/90 hover:scale-110 active:scale-95 group shadow-2xl"
                >
                  Get Your Business Plan
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

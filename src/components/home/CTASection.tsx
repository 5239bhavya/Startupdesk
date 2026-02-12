import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-20 lg:py-28">
      <div className="container">
        <div className="relative overflow-hidden rounded-3xl gradient-primary p-8 md:p-16">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-background/10 via-transparent to-transparent" />
          
          <div className="relative mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl mb-4">
              Ready to Start Your Business?
            </h2>
            <p className="text-lg text-primary-foreground/80 mb-8">
              Get your personalized AI-powered business plan in minutes. 
              No guesswork, just practical guidance.
            </p>
            <Link to="/start">
              <Button 
                size="xl" 
                className="bg-background text-foreground hover:bg-background/90 group"
              >
                Get Your Business Plan
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

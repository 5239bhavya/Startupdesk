import React from "react";
import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";

const items = [
  { name: "Priya S.", role: "Founder, LocalBakery", text: "SmartBiz helped me build a clear plan and find my first customers.", avatar: "https://i.pravatar.cc/64?img=5", rating: 5 },
  { name: "Arjun K.", role: "Co-founder, FarmFresh", text: "The AI advisor suggested a pricing model that doubled our margins.", avatar: "https://i.pravatar.cc/64?img=12", rating: 5 },
  { name: "Neha P.", role: "Solo Founder", text: "Fast, practical and actionable — perfect for first-time founders.", avatar: "https://i.pravatar.cc/64?img=20", rating: 5 },
];

export function Testimonials() {
  return (
    <section className="py-20">
      <div className="container">
        <div className="mx-auto max-w-4xl text-center mb-12 animate-slide-up">
          <h3 className="text-3xl font-bold mb-4">What founders say</h3>
          <p className="text-muted-foreground text-lg">Real feedback from entrepreneurs who launched with SmartBiz AI</p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {items.map((it, index) => (
            <Card
              key={it.name}
              variant="glass"
              className="p-6 hover-lift animate-slide-up"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="relative">
                  <img
                    src={it.avatar}
                    alt={it.name}
                    className="h-12 w-12 rounded-full ring-2 ring-primary/20 hover:ring-primary/50 transition-all"
                  />
                  <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-success rounded-full border-2 border-background" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">{it.name}</div>
                  <div className="text-sm text-muted-foreground">{it.role}</div>
                </div>
              </div>

              {/* Star rating */}
              <div className="flex gap-1 mb-3">
                {Array.from({ length: it.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                ))}
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">
                "{it.text}"
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

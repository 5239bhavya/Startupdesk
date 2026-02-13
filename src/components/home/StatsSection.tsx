import React, { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";

const counters = [
  { label: "Users helped", value: 12000 },
  { label: "Plans generated", value: 4800 },
  { label: "Avg time", value: 5, suffix: " mins" },
];

function animateCount(el: HTMLElement, to: number, suffix = "") {
  let start = 0;
  const duration = 1200;
  const startTime = performance.now();
  function tick(now: number) {
    const t = Math.min(1, (now - startTime) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    const current = Math.floor(eased * to + (1 - eased) * start);
    el.textContent = current.toLocaleString() + suffix;
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

export function StatsSection() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [hasAnimated, setHasAnimated] = React.useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || hasAnimated) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            const nodes = el.querySelectorAll<HTMLElement>("[data-target]");
            nodes.forEach((n) => {
              const to = Number(n.dataset.target || "0");
              const suffix = n.dataset.suffix || "";
              animateCount(n, to, suffix);
            });
            setHasAnimated(true);
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasAnimated]);

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />

      <div className="container relative">
        <div className="mx-auto max-w-4xl text-center animate-slide-up">
          <h3 className="text-3xl font-bold mb-4">Trusted by founders worldwide</h3>
          <p className="text-muted-foreground mb-12">We help entrepreneurs build viable, investor-ready plans quickly.</p>
        </div>

        <div ref={ref} className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {counters.map((c, index) => (
            <Card
              key={c.label}
              variant="glass"
              className="p-8 text-center hover-scale animate-scale-bounce"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div
                className="text-5xl font-extrabold gradient-text mb-2"
                data-target={c.value}
                data-suffix={c.suffix || ""}
              >
                0
              </div>
              <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
                {c.label}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

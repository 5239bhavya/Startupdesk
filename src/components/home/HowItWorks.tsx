import { ClipboardList, Sparkles, CheckCircle, FileText } from "lucide-react";

const steps = [
  {
    icon: ClipboardList,
    step: "01",
    title: "Enter Your Details",
    description: "Share your budget, city, interests, and experience level.",
  },
  {
    icon: Sparkles,
    step: "02",
    title: "AI Analyzes & Recommends",
    description: "Our AI generates 3 tailored business ideas with complete analysis.",
  },
  {
    icon: CheckCircle,
    step: "03",
    title: "Select Your Business",
    description: "Choose the business idea that resonates with you the most.",
  },
  {
    icon: FileText,
    step: "04",
    title: "Get Complete Plan",
    description: "Receive a detailed business plan covering all aspects of your startup.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 lg:py-28 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-muted/30 via-transparent to-muted/30" />

      <div className="container relative">
        <div className="mx-auto max-w-2xl text-center mb-16 animate-slide-up">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground">
            Simple 4-step process to get your personalized business plan
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <div
              key={step.step}
              className="relative group animate-slide-up"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="absolute top-10 left-1/2 hidden h-0.5 w-full bg-gradient-to-r from-primary/50 to-accent/50 lg:block" />
              )}

              <div className="relative flex flex-col items-center text-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl glass shadow-lg border relative z-10 group-hover:scale-110 transition-transform duration-300">
                  <step.icon className="h-8 w-8 text-primary group-hover:rotate-12 transition-transform" />
                  <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full gradient-primary text-xs font-bold text-primary-foreground animate-pulse-glow">
                    {step.step}
                  </span>
                </div>
                <h3 className="mb-2 font-semibold text-lg group-hover:text-primary transition-colors">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm max-w-[200px]">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

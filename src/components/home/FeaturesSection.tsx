import { 
  Lightbulb, 
  Package, 
  Users, 
  MapPin, 
  Calculator, 
  Megaphone, 
  TrendingUp 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Lightbulb,
    title: "Business Idea Selection",
    description: "Get 3 tailored business ideas based on your budget, location, and interests with detailed feasibility analysis.",
  },
  {
    icon: Package,
    title: "Raw Material Sourcing",
    description: "Learn where to buy materials, understand cost structures, and discover reliable suppliers.",
  },
  {
    icon: Users,
    title: "Workforce Planning",
    description: "Know exactly who to hire, required skills, salary ranges, and how many team members you need.",
  },
  {
    icon: MapPin,
    title: "Location Strategy",
    description: "Find the perfect location type, ideal shop size, rent estimates, and setup requirements.",
  },
  {
    icon: Calculator,
    title: "Pricing Guidance",
    description: "Calculate costs, set competitive prices, and understand your profit margins clearly.",
  },
  {
    icon: Megaphone,
    title: "Marketing Plan",
    description: "Get a 30-day launch plan with online and offline strategies that fit your budget.",
  },
  {
    icon: TrendingUp,
    title: "Growth Roadmap",
    description: "Month-by-month action plan, expansion strategies, and common mistakes to avoid.",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 lg:py-28">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Everything You Need to Start
          </h2>
          <p className="text-lg text-muted-foreground">
            Comprehensive AI-powered guidance for every aspect of your business
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card 
              key={feature.title} 
              variant="interactive"
              className="animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 font-semibold text-lg">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

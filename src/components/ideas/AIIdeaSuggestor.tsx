import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { UserProfile, BusinessIdea } from "@/types/business";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Sparkles,
  Lightbulb,
  TrendingUp,
  IndianRupee,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Send,
  ArrowRight,
} from "lucide-react";

interface AIIdeaSuggestorProps {
  userProfile: UserProfile;
  onSelectIdea: (idea: BusinessIdea) => void;
}

interface SuggestedIdea extends BusinessIdea {
  whyNow?: string;
  marketTrend?: string;
}

export const AIIdeaSuggestor = ({ userProfile, onSelectIdea }: AIIdeaSuggestorProps) => {
  const [userIdea, setUserIdea] = useState("");
  const [ideas, setIdeas] = useState<SuggestedIdea[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchIdeas = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('suggest-ideas', {
        body: {
          userIdea: userIdea.trim(),
          budget: userProfile.budget,
          city: userProfile.city,
          interest: userProfile.interest,
          experience: userProfile.experience,
        }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setIdeas(data.ideas || []);
    } catch (err) {
      console.error('Error fetching ideas:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to get suggestions');
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'bg-success/10 text-success border-success/20';
      case 'Medium': return 'bg-warning/10 text-warning border-warning/20';
      case 'High': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card className="overflow-hidden">
        <div className="gradient-primary p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-background/20 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-primary-foreground">
                AI Business Idea Generator
              </h3>
              <p className="text-primary-foreground/80 text-sm">
                Share your idea or let AI suggest trending opportunities
              </p>
            </div>
          </div>
        </div>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <Textarea
                placeholder="Describe your business idea (optional)... e.g., 'I want to start a food delivery service' or 'Something related to technology'"
                value={userIdea}
                onChange={(e) => setUserIdea(e.target.value)}
                rows={3}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Leave empty to get trending business ideas based on your profile
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-sm">
              <Badge variant="outline">Budget: {userProfile.budget}</Badge>
              <Badge variant="outline">City: {userProfile.city}</Badge>
              <Badge variant="outline">Interest: {userProfile.interest}</Badge>
              <Badge variant="outline">Experience: {userProfile.experience}</Badge>
            </div>
            <Button onClick={fetchIdeas} disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Ideas...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  {userIdea.trim() ? 'Analyze My Idea' : 'Suggest Trending Ideas'}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex gap-3 mb-4">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Ideas Grid */}
      {!isLoading && ideas.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            AI-Suggested Business Ideas
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {ideas.map((idea, index) => (
              <Card
                key={idea.id || index}
                className="hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => onSelectIdea(idea)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="text-3xl">{idea.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{idea.name}</h4>
                        <Badge variant="outline" className={getRiskColor(idea.riskLevel)}>
                          {idea.riskLevel} Risk
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {idea.description}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                    <div className="flex items-center gap-2">
                      <IndianRupee className="h-4 w-4 text-muted-foreground" />
                      <span>{idea.investmentRange}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-success" />
                      <span>{idea.profitMargin}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{idea.breakEvenTime}</span>
                    </div>
                    <div className="flex items-center gap-2 text-primary font-medium">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>{idea.expectedRevenue}</span>
                    </div>
                  </div>

                  {idea.whyNow && (
                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 mb-3">
                      <p className="text-xs text-primary font-medium mb-1">Why Now?</p>
                      <p className="text-sm">{idea.whyNow}</p>
                    </div>
                  )}

                  {idea.marketTrend && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <TrendingUp className="h-3 w-3" />
                      {idea.marketTrend}
                    </div>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-3 group-hover:bg-primary group-hover:text-primary-foreground"
                  >
                    Select This Idea
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && ideas.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <Lightbulb className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-semibold mb-2">Ready to Discover Ideas</h3>
            <p className="text-sm text-muted-foreground">
              Click the button above to get AI-powered business suggestions
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

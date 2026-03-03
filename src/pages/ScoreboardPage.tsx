import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Medal, Award, TrendingUp, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface LeaderboardEntry {
  user_id: string;
  total_points: number;
  rank: number;
  user_profiles: {
    full_name: string;
    business_name: string;
    industry: string;
  };
}

const ScoreboardPage = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        "http://127.0.0.1:5000/api/get-leaderboard?limit=50",
      );

      if (!response.ok) throw new Error("Failed to load leaderboard");

      const data = await response.json();
      setLeaderboard(data.leaderboard || []);
    } catch (error) {
      console.error("Error loading leaderboard:", error);
      toast.error("Failed to load leaderboard");
    } finally {
      setIsLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Award className="w-6 h-6 text-amber-600" />;
    return null;
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1)
      return "bg-yellow-500/10 text-yellow-700 border-yellow-500/20";
    if (rank === 2) return "bg-gray-400/10 text-gray-700 border-gray-400/20";
    if (rank === 3) return "bg-amber-600/10 text-amber-700 border-amber-600/20";
    return "bg-muted";
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-8 px-4 bg-muted/20">
        <div className="container max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Trophy className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold tracking-tight">
                Business Growth Leaderboard
              </h1>
            </div>
            <p className="text-muted-foreground">
              Grow your business. Lead the race.
            </p>
          </div>

          {/* Top 3 Podium */}
          {leaderboard.length >= 3 && (
            <div className="grid grid-cols-3 gap-4 mb-8">
              {/* 2nd Place */}
              <Card className={`${getRankBadge(2)} border-2 mt-8`}>
                <CardContent className="pt-6 text-center">
                  <div className="flex justify-center mb-2">
                    {getRankIcon(2)}
                  </div>
                  <Avatar className="w-16 h-16 mx-auto mb-2">
                    <AvatarFallback className="text-lg">
                      {getInitials(
                        leaderboard[1]?.user_profiles?.full_name || "U",
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold truncate">
                    {leaderboard[1]?.user_profiles?.full_name || "User"}
                  </h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {leaderboard[1]?.user_profiles?.business_name || "Business"}
                  </p>
                  <Badge variant="secondary" className="mt-2">
                    {leaderboard[1]?.total_points} pts
                  </Badge>
                </CardContent>
              </Card>

              {/* 1st Place */}
              <Card className={`${getRankBadge(1)} border-2`}>
                <CardContent className="pt-6 text-center">
                  <div className="flex justify-center mb-2">
                    {getRankIcon(1)}
                  </div>
                  <Avatar className="w-20 h-20 mx-auto mb-2">
                    <AvatarFallback className="text-xl">
                      {getInitials(
                        leaderboard[0]?.user_profiles?.full_name || "U",
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold truncate">
                    {leaderboard[0]?.user_profiles?.full_name || "User"}
                  </h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {leaderboard[0]?.user_profiles?.business_name || "Business"}
                  </p>
                  <Badge variant="secondary" className="mt-2">
                    {leaderboard[0]?.total_points} pts
                  </Badge>
                </CardContent>
              </Card>

              {/* 3rd Place */}
              <Card className={`${getRankBadge(3)} border-2 mt-8`}>
                <CardContent className="pt-6 text-center">
                  <div className="flex justify-center mb-2">
                    {getRankIcon(3)}
                  </div>
                  <Avatar className="w-16 h-16 mx-auto mb-2">
                    <AvatarFallback className="text-lg">
                      {getInitials(
                        leaderboard[2]?.user_profiles?.full_name || "U",
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold truncate">
                    {leaderboard[2]?.user_profiles?.full_name || "User"}
                  </h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {leaderboard[2]?.user_profiles?.business_name || "Business"}
                  </p>
                  <Badge variant="secondary" className="mt-2">
                    {leaderboard[2]?.total_points} pts
                  </Badge>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Full Leaderboard */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                All Rankings
              </CardTitle>
            </CardHeader>
            <CardContent>
              {leaderboard.length === 0 ? (
                <div className="text-center py-12">
                  <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    No rankings yet. Be the first!
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {leaderboard.map((entry, index) => (
                    <div
                      key={entry.user_id}
                      className={`flex items-center gap-4 p-4 rounded-lg ${
                        index < 3 ? getRankBadge(index + 1) : "bg-muted/30"
                      }`}
                    >
                      <div className="flex items-center justify-center w-12">
                        {getRankIcon(index + 1) || (
                          <span className="text-lg font-bold text-muted-foreground">
                            #{index + 1}
                          </span>
                        )}
                      </div>
                      <Avatar>
                        <AvatarFallback>
                          {getInitials(entry.user_profiles?.full_name || "U")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-semibold">
                          {entry.user_profiles?.full_name || "User"}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {entry.user_profiles?.business_name || "Business"} •{" "}
                          {entry.user_profiles?.industry || "Industry"}
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-lg px-3 py-1">
                        {entry.total_points} pts
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Points Info */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>How to Earn Points</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Badge variant="secondary" className="mt-1">
                    +10
                  </Badge>
                  <div>
                    <p className="font-medium">Complete Profile</p>
                    <p className="text-sm text-muted-foreground">
                      Fill in all your details
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="secondary" className="mt-1">
                    +20
                  </Badge>
                  <div>
                    <p className="font-medium">Create Business Plan</p>
                    <p className="text-sm text-muted-foreground">
                      Generate your first plan
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="secondary" className="mt-1">
                    +15
                  </Badge>
                  <div>
                    <p className="font-medium">Generate Ads</p>
                    <p className="text-sm text-muted-foreground">
                      Create marketing content
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="secondary" className="mt-1">
                    +10
                  </Badge>
                  <div>
                    <p className="font-medium">Weekly Dashboard Update</p>
                    <p className="text-sm text-muted-foreground">
                      Keep your metrics current
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="secondary" className="mt-1">
                    +50
                  </Badge>
                  <div>
                    <p className="font-medium">Revenue Growth Milestone</p>
                    <p className="text-sm text-muted-foreground">
                      Hit your revenue targets
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ScoreboardPage;

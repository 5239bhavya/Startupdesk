import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  User,
  Building2,
  Phone,
  MapPin,
  Briefcase,
  Edit,
  Lock,
  Save,
  TrendingUp,
  FileText,
  BarChart3,
  Trophy,
  Loader2,
  BookOpen,
  Image as ImageIcon,
} from "lucide-react";
import { SavedAdsSection } from "@/components/profile/SavedAdsSection";

interface UserProfile {
  full_name: string;
  phone: string;
  business_name: string;
  industry: string;
  business_stage: string;
  location: string;
  preferred_category: string;
}

interface UserProgress {
  plans_created: number;
  marketing_campaigns_generated: number;
  dashboard_updates: number;
  budget_optimization_count: number;
  revenue_growth: number;
}

interface UserPoints {
  total_points: number;
  rank: number;
}

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [points, setPoints] = useState<UserPoints | null>(null);
  const [savedPlans, setSavedPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    loadProfileData();
  }, [user, navigate]);

  const loadProfileData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Load profile
      const { data: profileData } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (profileData) setProfile(profileData);

      // Load progress
      const { data: progressData } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (progressData) setProgress(progressData);

      // Load points
      const { data: pointsData } = await supabase
        .from("user_points")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (pointsData) setPoints(pointsData);

      // Load saved plans
      const { data: plansData } = await supabase
        .from("saved_business_plans")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (plansData) setSavedPlans(plansData);
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Failed to load profile data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProfile = () => {
    setEditedProfile(profile);
    setEditDialogOpen(true);
  };

  const handleSaveProfile = async () => {
    if (!user || !editedProfile) return;

    setIsSaving(true);
    try {
      const response = await fetch(
        "http://127.0.0.1:5000/api/update-user-profile",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: user.id,
            ...editedProfile,
          }),
        },
      );

      if (!response.ok) throw new Error("Failed to update profile");

      setProfile(editedProfile);
      setEditDialogOpen(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setPasswordDialogOpen(false);
      setNewPassword("");
      toast.success("Password changed successfully!");
    } catch (error: any) {
      console.error("Error changing password:", error);
      toast.error(error.message || "Failed to change password");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadPlan = (plan: any) => {
    sessionStorage.setItem(
      "selectedBusiness",
      JSON.stringify(plan.business_idea),
    );
    sessionStorage.setItem("userProfile", JSON.stringify(plan.user_profile));
    sessionStorage.setItem("loadedPlan", JSON.stringify(plan.business_plan));
    navigate("/plan");
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
        <div className="container max-w-6xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
              <p className="text-muted-foreground">
                Manage your account and track your progress
              </p>
            </div>
            {points && (
              <Badge variant="secondary" className="text-lg px-4 py-2">
                <Trophy className="w-4 h-4 mr-2" />
                {points.total_points} Points
                {points.rank && ` • Rank #${points.rank}`}
              </Badge>
            )}
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 lg:w-auto">
              <TabsTrigger value="profile">
                <User className="w-4 h-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="plans">
                <FileText className="w-4 h-4 mr-2" />
                Saved Plans
              </TabsTrigger>
              <TabsTrigger value="ads">
                <ImageIcon className="w-4 h-4 mr-2" />
                Saved Ads
              </TabsTrigger>
              <TabsTrigger value="progress">
                <BarChart3 className="w-4 h-4 mr-2" />
                Progress
              </TabsTrigger>
              <TabsTrigger value="guide">
                <BookOpen className="w-4 h-4 mr-2" />
                Success Guide
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Personal Information</CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleEditProfile}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPasswordDialogOpen(true)}
                      >
                        <Lock className="w-4 h-4 mr-2" />
                        Change Password
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Full Name
                        </p>
                        <p className="font-medium">
                          {profile?.full_name || "Not set"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium">
                          {profile?.phone || "Not set"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Building2 className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Business Name
                        </p>
                        <p className="font-medium">
                          {profile?.business_name || "Not set"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Briefcase className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Industry
                        </p>
                        <p className="font-medium">
                          {profile?.industry || "Not set"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Business Stage
                        </p>
                        <p className="font-medium">
                          {profile?.business_stage || "Not set"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Location
                        </p>
                        <p className="font-medium">
                          {profile?.location || "Not set"}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Saved Plans Tab */}
            <TabsContent value="plans">
              <Card>
                <CardHeader>
                  <CardTitle>Saved Business Plans</CardTitle>
                </CardHeader>
                <CardContent>
                  {savedPlans.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        No saved plans yet
                      </p>
                      <Button
                        className="mt-4"
                        onClick={() => navigate("/start")}
                      >
                        Create Your First Plan
                      </Button>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {savedPlans.map((plan) => (
                        <Card
                          key={plan.id}
                          className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => handleLoadPlan(plan)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-semibold">
                                  {plan.plan_name}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  Created{" "}
                                  {new Date(
                                    plan.created_at,
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                              <Button variant="outline" size="sm">
                                View Plan
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Saved Ads Tab */}
            <TabsContent value="ads">
              <Card>
                <CardHeader>
                  <CardTitle>Saved Advertisement Creatives</CardTitle>
                </CardHeader>
                <CardContent>
                  <SavedAdsSection userId={user?.id || ""} />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Progress Tab */}
            <TabsContent value="progress">
              <Card>
                <CardHeader>
                  <CardTitle>Your Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                      <FileText className="w-8 h-8 text-primary mb-2" />
                      <p className="text-2xl font-bold">
                        {progress?.plans_created || 0}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Plans Created
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-success/5 border border-success/20">
                      <TrendingUp className="w-8 h-8 text-success mb-2" />
                      <p className="text-2xl font-bold">
                        {progress?.marketing_campaigns_generated || 0}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Marketing Campaigns
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
                      <BarChart3 className="w-8 h-8 text-blue-500 mb-2" />
                      <p className="text-2xl font-bold">
                        {progress?.dashboard_updates || 0}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Dashboard Updates
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Success Guide Tab */}
            <TabsContent value="guide">
              <Card>
                <CardHeader>
                  <CardTitle>Success Guide</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Your personalized success guide will be generated based on
                    your business type and stage.
                  </p>
                  <Button onClick={() => navigate("/profile?tab=guide")}>
                    <BookOpen className="w-4 h-4 mr-2" />
                    Generate Success Guide
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />

      {/* Edit Profile Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your personal and business information
            </DialogDescription>
          </DialogHeader>
          {editedProfile && (
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  value={editedProfile.full_name || ""}
                  onChange={(e) =>
                    setEditedProfile({
                      ...editedProfile,
                      full_name: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={editedProfile.phone || ""}
                  onChange={(e) =>
                    setEditedProfile({
                      ...editedProfile,
                      phone: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Business Name</Label>
                <Input
                  value={editedProfile.business_name || ""}
                  onChange={(e) =>
                    setEditedProfile({
                      ...editedProfile,
                      business_name: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Industry</Label>
                <Input
                  value={editedProfile.industry || ""}
                  onChange={(e) =>
                    setEditedProfile({
                      ...editedProfile,
                      industry: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  value={editedProfile.location || ""}
                  onChange={(e) =>
                    setEditedProfile({
                      ...editedProfile,
                      location: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveProfile} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>Enter your new password</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>New Password</Label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              minLength={6}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPasswordDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleChangePassword} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Lock className="w-4 h-4 mr-2" />
              )}
              Change Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfilePage;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PlanSection, ListItem, InfoRow } from "@/components/plan/PlanSection";
import { FinancialCharts } from "@/components/charts/FinancialCharts";
import { AISupplierList } from "@/components/suppliers/AISupplierList";
import { SupplierComparison } from "@/components/suppliers/SupplierComparison";
import { ProgressDashboard } from "@/components/dashboard/ProgressDashboard";
import { CostCalculator } from "@/components/calculator/CostCalculator";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BusinessPlan, BusinessIdea, UserProfile } from "@/types/business";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { generateBusinessPlanPDF } from "@/utils/pdfGenerator";
import {
  Package,
  Users,
  MapPin,
  Calculator,
  Megaphone,
  TrendingUp,
  ArrowLeft,
  Download,
  Lightbulb,
  IndianRupee,
  AlertCircle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Save,
  BarChart3,
  ShoppingCart,
  LayoutDashboard,
} from "lucide-react";

const BusinessPlanPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [plan, setPlan] = useState<BusinessPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessIdea | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [planName, setPlanName] = useState("");

  useEffect(() => {
    const storedBusiness = sessionStorage.getItem("selectedBusiness");
    const storedProfile = sessionStorage.getItem("userProfile");
    const loadedPlan = sessionStorage.getItem("loadedPlan");

    if (storedBusiness && storedProfile) {
      const business = JSON.parse(storedBusiness);
      const profile = JSON.parse(storedProfile);
      setSelectedBusiness(business);
      setUserProfile(profile);
      setPlanName(business.name);

      // Check if we have a pre-loaded plan (from saved plans)
      if (loadedPlan) {
        const parsedPlan = JSON.parse(loadedPlan);
        setPlan({ idea: business, ...parsedPlan });
        setIsLoading(false);
        sessionStorage.removeItem("loadedPlan");
      } else {
        generateBusinessPlan(profile, business);
      }
    } else {
      navigate("/recommendations");
    }
  }, [navigate]);

  const generateBusinessPlan = async (profile: UserProfile, business: BusinessIdea) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('generate-business-plan', {
        body: { userProfile: profile, selectedBusiness: business }
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setPlan(data);
    } catch (err) {
      console.error("Error generating business plan:", err);
      const message = err instanceof Error ? err.message : "Failed to generate business plan";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    if (userProfile && selectedBusiness) {
      generateBusinessPlan(userProfile, selectedBusiness);
    }
  };

  const handleDownloadPDF = async () => {
    if (!plan) return;

    setIsDownloading(true);
    try {
      await generateBusinessPlanPDF(plan);
      toast.success("Business plan downloaded successfully!");
    } catch (err) {
      toast.error("Failed to download PDF");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSavePlan = async () => {
    if (!user) {
      toast.error("Please sign in to save your plan");
      navigate("/auth");
      return;
    }

    if (!plan || !userProfile || !selectedBusiness || !planName.trim()) {
      toast.error("Please enter a name for your plan");
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase.from("saved_business_plans").insert([{
        user_id: user.id,
        plan_name: planName.trim(),
        user_profile: JSON.parse(JSON.stringify(userProfile)),
        business_idea: JSON.parse(JSON.stringify(selectedBusiness)),
        business_plan: JSON.parse(JSON.stringify(plan)),
      }]);

      if (error) throw error;

      toast.success("Business plan saved successfully!");
      toast.success("Business plan saved successfully!");
      setSaveDialogOpen(false);

      // Update local state to reflect new name immediately
      if (plan && userProfile && selectedBusiness) {
        const updatedBusiness = { ...selectedBusiness, name: planName.trim() };
        setSelectedBusiness(updatedBusiness);
        setPlan({ ...plan, idea: updatedBusiness });
        sessionStorage.setItem("selectedBusiness", JSON.stringify(updatedBusiness));
      }
    } catch (err) {
      console.error("Error saving plan:", err);
      toast.error("Failed to save plan");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center py-12 px-4">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-lg font-medium">Generating your business plan...</p>
            <p className="text-sm text-muted-foreground">This may take a moment</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center py-12 px-4">
          <div className="text-center">
            <p className="text-lg font-medium text-destructive mb-4">{error}</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => navigate("/recommendations")} variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
              <Button onClick={handleRetry}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!plan) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-8 px-4 bg-muted/20">
        <div className="container max-w-5xl">
          {/* Business Overview Header */}
          <Card className="mb-8 overflow-hidden">
            <div className="gradient-primary p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-background/20 text-4xl backdrop-blur-sm">
                  {plan.idea.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-2xl md:text-3xl font-bold text-primary-foreground">
                      {plan.idea.name}
                    </h1>
                    <Badge className="bg-background/20 text-primary-foreground border-0">
                      {plan.idea.riskLevel} Risk
                    </Badge>
                  </div>
                  <p className="text-primary-foreground/80 max-w-2xl">
                    {plan.idea.description}
                  </p>
                </div>
              </div>
            </div>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <IndianRupee className="h-5 w-5 mx-auto mb-2 text-primary" />
                  <p className="text-xs text-muted-foreground mb-1">Investment</p>
                  <p className="font-semibold text-sm">{plan.idea.investmentRange}</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <TrendingUp className="h-5 w-5 mx-auto mb-2 text-primary" />
                  <p className="text-xs text-muted-foreground mb-1">Revenue</p>
                  <p className="font-semibold text-sm">{plan.idea.expectedRevenue}</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-success/10">
                  <CheckCircle2 className="h-5 w-5 mx-auto mb-2 text-success" />
                  <p className="text-xs text-muted-foreground mb-1">Profit Margin</p>
                  <p className="font-semibold text-sm text-success">{plan.idea.profitMargin}</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <Lightbulb className="h-5 w-5 mx-auto mb-2 text-primary" />
                  <p className="text-xs text-muted-foreground mb-1">Break-even</p>
                  <p className="font-semibold text-sm">{plan.idea.breakEvenTime}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabbed Content */}
          <Tabs defaultValue="dashboard" className="space-y-6">
            <TabsList className="w-full flex-wrap h-auto gap-2 bg-transparent p-0">
              {[
                { value: "dashboard", label: "Dashboard", icon: LayoutDashboard },
                { value: "financials", label: "Financials", icon: BarChart3 },
                { value: "suppliers", label: "Suppliers", icon: ShoppingCart },
                { value: "materials", label: "Raw Materials", icon: Package },
                { value: "workforce", label: "Workforce", icon: Users },
                { value: "location", label: "Location", icon: MapPin },
                { value: "pricing", label: "Pricing", icon: Calculator },
                { value: "marketing", label: "Marketing", icon: Megaphone },
                { value: "growth", label: "Growth", icon: TrendingUp },
              ].map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="flex-1 min-w-[80px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <tab.icon className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="dashboard" className="animate-fade-in">
              <ProgressDashboard plan={plan} />
            </TabsContent>

            <TabsContent value="financials" className="animate-fade-in">
              <FinancialCharts idea={plan.idea} pricing={plan.pricing} />
            </TabsContent>

            <TabsContent value="suppliers" className="animate-fade-in">
              <PlanSection icon={ShoppingCart} title="Supplier Comparison">
                <SupplierComparison materials={plan.rawMaterials || []} />
              </PlanSection>
            </TabsContent>

            <TabsContent value="materials" className="animate-fade-in">
              <PlanSection icon={Package} title="Raw Material & Supplier Guidance">
                <div className="space-y-6">
                  {plan.rawMaterials?.map((material, index) => (
                    <div key={index} className="p-4 rounded-lg bg-muted/30 space-y-3">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">{material.name}</h4>
                        <Badge variant="secondary">{material.estimatedCost}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <strong>Source:</strong> {material.sourceType}
                      </p>
                      <div className="flex items-start gap-2 text-sm text-primary bg-primary/5 p-3 rounded-lg">
                        <Lightbulb className="h-4 w-4 mt-0.5 shrink-0" />
                        <span>{material.tips}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </PlanSection>
            </TabsContent>

            <TabsContent value="workforce" className="animate-fade-in">
              <PlanSection icon={Users} title="Skill & Workforce Requirements">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 font-medium">Role</th>
                        <th className="text-left py-3 font-medium">Skill Level</th>
                        <th className="text-center py-3 font-medium">Count</th>
                        <th className="text-right py-3 font-medium">Salary</th>
                      </tr>
                    </thead>
                    <tbody>
                      {plan.workforce?.map((worker, index) => (
                        <tr key={index} className="border-b border-border/50">
                          <td className="py-3 font-medium">{worker.role}</td>
                          <td className="py-3 text-muted-foreground">{worker.skillLevel}</td>
                          <td className="py-3 text-center">{worker.count}</td>
                          <td className="py-3 text-right text-success font-medium">
                            {worker.estimatedSalary}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </PlanSection>
            </TabsContent>

            <TabsContent value="location" className="animate-fade-in">
              <PlanSection icon={MapPin} title="Offline Setup & Location Advice">
                <div className="space-y-4">
                  <InfoRow label="Recommended Area Type" value={plan.location?.areaType || ''} />
                  <InfoRow label="Shop Size" value={plan.location?.shopSize || ''} />
                  <InfoRow label="Estimated Rent" value={plan.location?.rentEstimate || ''} />

                  <div className="pt-4">
                    <h4 className="font-medium mb-3">Setup Requirements</h4>
                    <ul className="space-y-2">
                      {plan.location?.setupNeeds?.map((need, index) => (
                        <ListItem key={index}>{need}</ListItem>
                      ))}
                    </ul>
                  </div>
                </div>
              </PlanSection>
            </TabsContent>

            <TabsContent value="pricing" className="animate-fade-in">
              <PlanSection icon={Calculator} title="Pricing Strategy">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Cost Components</h4>
                    <ul className="space-y-2">
                      {plan.pricing?.costComponents?.map((component, index) => (
                        <ListItem key={index}>{component}</ListItem>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <InfoRow label="Cost Price (avg)" value={plan.pricing?.costPrice || ''} />
                    <InfoRow label="Market Price Range" value={plan.pricing?.marketPriceRange || ''} />
                    <InfoRow label="Suggested Price" value={plan.pricing?.suggestedPrice || ''} highlight />
                    <InfoRow label="Profit Margin" value={plan.pricing?.profitMargin || ''} highlight />
                  </div>
                </div>
              </PlanSection>
            </TabsContent>

            <TabsContent value="marketing" className="animate-fade-in">
              <PlanSection icon={Megaphone} title="Marketing & Advertising Plan">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">30-Day Launch Plan</h4>
                    <ul className="space-y-2">
                      {plan.marketing?.launchPlan?.map((step, index) => (
                        <ListItem key={index} bullet={`${index + 1}.`}>{step}</ListItem>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3">Online Strategies</h4>
                    <ul className="space-y-2 mb-6">
                      {plan.marketing?.onlineStrategies?.map((strategy, index) => (
                        <ListItem key={index}>{strategy}</ListItem>
                      ))}
                    </ul>

                    <h4 className="font-medium mb-3">Offline Strategies</h4>
                    <ul className="space-y-2">
                      {plan.marketing?.offlineStrategies?.map((strategy, index) => (
                        <ListItem key={index}>{strategy}</ListItem>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-6 p-4 rounded-lg bg-success/5 border border-success/20">
                  <h4 className="font-medium mb-3 text-success flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Low-Budget Ideas
                  </h4>
                  <ul className="space-y-2">
                    {plan.marketing?.lowBudgetIdeas?.map((idea, index) => (
                      <ListItem key={index}>{idea}</ListItem>
                    ))}
                  </ul>
                </div>
              </PlanSection>
            </TabsContent>

            <TabsContent value="growth" className="animate-fade-in">
              <PlanSection icon={TrendingUp} title="Business Growth Roadmap">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Month 1-3: Foundation</h4>
                    <ul className="space-y-2 mb-6">
                      {plan.growth?.month1to3?.map((action, index) => (
                        <ListItem key={index}>{action}</ListItem>
                      ))}
                    </ul>

                    <h4 className="font-medium mb-3">Month 4-6: Growth</h4>
                    <ul className="space-y-2">
                      {plan.growth?.month4to6?.map((action, index) => (
                        <ListItem key={index}>{action}</ListItem>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3">Expansion Ideas</h4>
                    <ul className="space-y-2 mb-6">
                      {plan.growth?.expansionIdeas?.map((idea, index) => (
                        <ListItem key={index}>{idea}</ListItem>
                      ))}
                    </ul>

                    <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20">
                      <h4 className="font-medium mb-3 text-destructive flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Common Mistakes to Avoid
                      </h4>
                      <ul className="space-y-2">
                        {plan.growth?.mistakesToAvoid?.map((mistake, index) => (
                          <ListItem key={index}>{mistake}</ListItem>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </PlanSection>
            </TabsContent>
          </Tabs>

          {/* Footer Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-10 pt-6 border-t">
            <Button variant="outline" onClick={() => navigate("/recommendations")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Choose Different Business
            </Button>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setSaveDialogOpen(true)}>
                <Save className="mr-2 h-4 w-4" />
                Save Plan
              </Button>
              <Button size="lg" onClick={handleDownloadPDF} disabled={isDownloading}>
                {isDownloading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Download PDF
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* Save Plan Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Business Plan</DialogTitle>
            <DialogDescription>
              {user
                ? "Give your business plan a name to save it for later access."
                : "Sign in to save your business plan and access it later."}
            </DialogDescription>
          </DialogHeader>
          {user ? (
            <>
              <div className="py-4">
                <Input
                  placeholder="Enter plan name..."
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSavePlan} disabled={isSaving || !planName.trim()}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Plan
                    </>
                  )}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <DialogFooter>
              <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => navigate("/auth")}>
                Sign In to Save
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BusinessPlanPage;

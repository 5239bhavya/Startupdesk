import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { UserInputForm } from "@/components/form/UserInputForm";
import { BudgetPredictionFlow } from "@/components/form/BudgetPredictionFlow";
import { BusinessNameStep } from "@/components/form/BusinessNameStep";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, TrendingUp } from "lucide-react";

const StartPage = () => {
  const [showBudgetPrediction, setShowBudgetPrediction] = useState(false);
  const [budgetData, setBudgetData] = useState<any>(null);
  const [showBusinessName, setShowBusinessName] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [showMainForm, setShowMainForm] = useState(false);

  const handleBudgetComplete = (data: any) => {
    setBudgetData(data);
    setShowBusinessName(true); // Show business name step after budget
  };

  const handleBusinessNameComplete = (name: string) => {
    setBusinessName(name);
    setShowMainForm(true); // Show main form after business name
  };

  const handleSkipPrediction = () => {
    setShowBusinessName(true); // Still ask for business name even if skipping budget
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12 px-4 gradient-subtle">
        <div className="container">
          {/* Initial Choice Screen */}
          {!showBudgetPrediction && !showMainForm && (
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold tracking-tight mb-2">
                  Let's Find Your Perfect Business
                </h1>
                <p className="text-muted-foreground max-w-lg mx-auto">
                  Choose how you'd like to start your business journey
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Option 1: AI Budget Prediction */}
                <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <TrendingUp className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle>AI Budget Prediction</CardTitle>
                    </div>
                    <CardDescription className="text-base">
                      Describe your business idea and let AI predict the
                      required budget with detailed breakdown
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">✓</span>
                        <span>Get AI-powered budget estimation</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">✓</span>
                        <span>Detailed cost breakdown</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">✓</span>
                        <span>Feasibility analysis</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">✓</span>
                        <span>Cost optimization suggestions</span>
                      </li>
                    </ul>
                    <Button
                      onClick={() => setShowBudgetPrediction(true)}
                      className="w-full"
                      size="lg"
                    >
                      Start with AI Prediction
                    </Button>
                  </CardContent>
                </Card>

                {/* Option 2: Direct Form */}
                <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Lightbulb className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle>Quick Start</CardTitle>
                    </div>
                    <CardDescription className="text-base">
                      Already know your budget? Jump straight to business
                      recommendations
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">✓</span>
                        <span>Faster process</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">✓</span>
                        <span>Enter your known budget</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">✓</span>
                        <span>Get instant recommendations</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">✓</span>
                        <span>Skip AI analysis</span>
                      </li>
                    </ul>
                    <Button
                      onClick={handleSkipPrediction}
                      variant="outline"
                      className="w-full"
                      size="lg"
                    >
                      Skip to Form
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Budget Prediction Flow */}
          {showBudgetPrediction && !showMainForm && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="text-center mb-6">
                <h1 className="text-3xl font-bold tracking-tight mb-2">
                  AI Budget Prediction
                </h1>
                <p className="text-muted-foreground">
                  Describe your business idea and get an instant budget estimate
                </p>
              </div>
              <BudgetPredictionFlow onComplete={handleBudgetComplete} />
              <div className="text-center">
                <Button
                  variant="ghost"
                  onClick={handleSkipPrediction}
                  className="text-muted-foreground"
                >
                  Skip and enter budget manually
                </Button>
              </div>
            </div>
          )}

          {/* Business Name Step */}
          {showBusinessName && !showMainForm && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="text-center mb-6">
                <h1 className="text-3xl font-bold tracking-tight mb-2">
                  Name Your Business
                </h1>
                <p className="text-muted-foreground">
                  Choose a memorable name that represents your brand
                </p>
              </div>
              <BusinessNameStep
                businessIdea={budgetData?.business_type || ""}
                industry={budgetData?.business_type || ""}
                onComplete={handleBusinessNameComplete}
              />
            </div>
          )}

          {/* Main User Input Form */}
          {showMainForm && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold tracking-tight mb-2">
                  Complete Your Profile
                </h1>
                <p className="text-muted-foreground max-w-lg mx-auto">
                  {budgetData
                    ? "Great! Now let's gather a few more details to find the perfect business for you."
                    : "Answer a few questions and our AI will recommend the best business opportunities tailored to your situation."}
                </p>
              </div>

              {/* Show Budget Summary if prediction was done */}
              {budgetData && (
                <div className="max-w-xl mx-auto mb-6">
                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            AI Predicted Budget
                          </p>
                          <p className="text-2xl font-bold text-primary">
                            ₹
                            {budgetData.predicted_budget?.toLocaleString(
                              "en-IN",
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Your Budget
                          </p>
                          <p className="text-2xl font-bold text-green-600">
                            ₹{budgetData.user_budget?.toLocaleString("en-IN")}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Status
                          </p>
                          <p className="text-sm font-semibold capitalize">
                            {budgetData.feasibility?.status || "Analyzed"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              <UserInputForm
                initialBudget={budgetData?.user_budget?.toString()}
              />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default StartPage;

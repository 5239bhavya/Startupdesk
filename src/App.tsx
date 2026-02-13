import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import StartPage from "./pages/StartPage";
import RecommendationsPage from "./pages/RecommendationsPage";
import BusinessPlanPage from "./pages/BusinessPlanPage";
import AuthPage from "./pages/AuthPage";
import SavedPlansPage from "./pages/SavedPlansPage";
import MarketplacePage from "./pages/MarketplacePage";
import SmartBizAgent from "./pages/SmartBizAgent";
import DashboardPage from "./pages/DashboardPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  return (
    <div className="min-h-screen page-fade bg-background text-foreground">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/start" element={<StartPage />} />
                <Route path="/recommendations" element={<RecommendationsPage />} />
                <Route path="/plan" element={<BusinessPlanPage />} />
                <Route path="/saved-plans" element={<SavedPlansPage />} />
                <Route path="/marketplace" element={<MarketplacePage />} />
                <Route path="/ai-agent" element={<SmartBizAgent />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </div>
  );
};

export default App;

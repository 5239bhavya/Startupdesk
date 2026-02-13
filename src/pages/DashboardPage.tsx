import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
    LayoutDashboard,
    TrendingUp,
    DollarSign,
    Target,
    Megaphone,
    Settings,
    Plus,
} from "lucide-react";
import { SalesWidget } from "@/components/dashboard/SalesWidget.tsx";
import { CashFlowWidget } from "@/components/dashboard/CashFlowWidget.tsx";
import { PhaseTrackerWidget } from "@/components/dashboard/PhaseTrackerWidget.tsx";
import { AdvertisingWidget } from "@/components/dashboard/AdvertisingWidget.tsx";

// Constants
const DEFAULT_WIDGETS = ["sales", "cashflow", "phase", "advertising"] as const;
const PGRST_NOT_FOUND_CODE = "PGRST116";

// Types
interface DashboardConfig {
    user_id: string;
    active_widgets: string[];
}

interface QuickStat {
    id: string;
    title: string;
    value: string | number;
    subtitle: string;
    icon: React.ComponentType<{ className?: string }>;
}

const DashboardPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [activeWidgets, setActiveWidgets] = useState<string[]>([...DEFAULT_WIDGETS]);
    const [isLoading, setIsLoading] = useState(true);

    // Memoized quick stats configuration
    const quickStats: QuickStat[] = [
        {
            id: "revenue",
            title: "Total Revenue",
            value: "₹0",
            subtitle: "This month",
            icon: DollarSign,
        },
        {
            id: "sales",
            title: "Sales",
            value: 0,
            subtitle: "Transactions",
            icon: TrendingUp,
        },
        {
            id: "phase",
            title: "Current Phase",
            value: "Idea",
            subtitle: "0% Complete",
            icon: Target,
        },
        {
            id: "campaigns",
            title: "Ad Campaigns",
            value: 0,
            subtitle: "Active",
            icon: Megaphone,
        },
    ];

    // Load dashboard configuration
    const loadDashboardConfig = useCallback(async () => {
        if (!user?.id) return;

        try {
            const { data, error } = await supabase
                .from("dashboard_config")
                .select("*")
                .eq("user_id", user.id)
                .single();

            // Handle "not found" error separately
            if (error && error.code !== PGRST_NOT_FOUND_CODE) {
                throw error;
            }

            if (data) {
                // Use existing configuration
                setActiveWidgets(data.active_widgets || [...DEFAULT_WIDGETS]);
            } else {
                // Create default configuration for new users
                const { error: insertError } = await supabase
                    .from("dashboard_config")
                    .insert({
                        user_id: user.id,
                        active_widgets: [...DEFAULT_WIDGETS],
                    });

                if (insertError) {
                    console.error("Error creating dashboard config:", insertError);
                    // Still set default widgets even if insert fails
                    setActiveWidgets([...DEFAULT_WIDGETS]);
                }
            }
        } catch (error) {
            console.error("Error loading dashboard config:", error);
            toast.error("Failed to load dashboard configuration");
            // Fallback to default widgets
            setActiveWidgets([...DEFAULT_WIDGETS]);
        } finally {
            setIsLoading(false);
        }
    }, [user?.id]);

    // Authentication and initialization
    useEffect(() => {
        if (!user) {
            navigate("/auth");
            return;
        }
        loadDashboardConfig();
    }, [user, navigate, loadDashboardConfig]);

    // Check if a widget is active
    const isWidgetActive = useCallback(
        (widgetId: string): boolean => activeWidgets.includes(widgetId),
        [activeWidgets]
    );

    // Handle customize button click
    const handleCustomize = useCallback(() => {
        // TODO: Implement customization modal/page
        toast.info("Customization feature coming soon!");
    }, []);

    // Handle add widgets button click
    const handleAddWidgets = useCallback(() => {
        // TODO: Implement widget selection modal
        toast.info("Widget selection coming soon!");
    }, []);

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <LayoutDashboard className="h-12 w-12 animate-pulse text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-8">
                {/* Dashboard Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <LayoutDashboard className="h-8 w-8 text-primary" />
                            Business Dashboard
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Track your business progress, sales, and growth
                        </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleCustomize}>
                        <Settings className="h-4 w-4 mr-2" />
                        Customize
                    </Button>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {quickStats.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <Card key={stat.id}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        {stat.title}
                                    </CardTitle>
                                    <Icon className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stat.value}</div>
                                    <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Dashboard Widgets Grid */}
                {activeWidgets.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {isWidgetActive("sales") && <SalesWidget />}
                        {isWidgetActive("cashflow") && <CashFlowWidget />}
                        {isWidgetActive("phase") && <PhaseTrackerWidget />}
                        {isWidgetActive("advertising") && <AdvertisingWidget />}
                    </div>
                ) : (
                    /* Empty State */
                    <Card className="p-12 text-center">
                        <LayoutDashboard className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No Widgets Active</h3>
                        <p className="text-muted-foreground mb-4">
                            Add widgets to your dashboard to start tracking your business
                        </p>
                        <Button onClick={handleAddWidgets}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Widgets
                        </Button>
                    </Card>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default DashboardPage;

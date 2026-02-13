import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
    Megaphone,
    Plus,
    TrendingUp,
    DollarSign,
    Eye,
    MousePointerClick,
    Target,
    Loader2,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface Campaign {
    id: string;
    platform: string;
    campaign_name: string;
    budget: number;
    spent: number;
    impressions: number;
    clicks: number;
    conversions: number;
    status: string;
}

const platformRecommendations = [
    {
        platform: "Google Ads",
        icon: "🔍",
        description: "Capture high-intent customers actively searching",
        minBudget: "₹500/day",
        bestFor: ["Services", "E-commerce", "Local businesses"],
        color: "bg-blue-500",
    },
    {
        platform: "Facebook & Instagram",
        icon: "📱",
        description: "Visual storytelling with precise targeting",
        minBudget: "₹300/day",
        bestFor: ["B2C", "Visual products", "Brand awareness"],
        color: "bg-purple-500",
    },
    {
        platform: "LinkedIn",
        icon: "💼",
        description: "Reach decision-makers and professionals",
        minBudget: "₹1000/day",
        bestFor: ["B2B", "Professional services", "Recruitment"],
        color: "bg-blue-700",
    },
    {
        platform: "YouTube",
        icon: "🎥",
        description: "Engage with video content and tutorials",
        minBudget: "₹200/day",
        bestFor: ["Education", "Entertainment", "Product demos"],
        color: "bg-red-500",
    },
];

export const AdvertisingWidget = () => {
    const { user } = useAuth();
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newCampaign, setNewCampaign] = useState({
        platform: "",
        campaign_name: "",
        budget: "",
        start_date: new Date().toISOString().split("T")[0],
    });

    useEffect(() => {
        if (user) {
            loadCampaigns();
        }
    }, [user]);

    const loadCampaigns = async () => {
        try {
            const { data, error } = await supabase
                .from("advertising_campaigns")
                .select("*")
                .eq("user_id", user?.id)
                .order("created_at", { ascending: false });

            if (error) throw error;
            setCampaigns(data || []);
        } catch (error) {
            console.error("Error loading campaigns:", error);
            toast.error("Failed to load campaigns");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddCampaign = async () => {
        if (!newCampaign.platform || !newCampaign.campaign_name || !newCampaign.budget) {
            toast.error("Please fill all required fields");
            return;
        }

        try {
            const { error } = await supabase.from("advertising_campaigns").insert({
                user_id: user?.id,
                platform: newCampaign.platform,
                campaign_name: newCampaign.campaign_name,
                budget: parseFloat(newCampaign.budget),
                start_date: newCampaign.start_date,
                status: "active",
            });

            if (error) throw error;

            toast.success("Campaign added successfully!");
            setIsDialogOpen(false);
            setNewCampaign({
                platform: "",
                campaign_name: "",
                budget: "",
                start_date: new Date().toISOString().split("T")[0],
            });
            loadCampaigns();
        } catch (error) {
            console.error("Error adding campaign:", error);
            toast.error("Failed to add campaign");
        }
    };

    const calculateROI = (campaign: Campaign) => {
        if (campaign.spent === 0) return 0;
        const revenue = campaign.conversions * 1000; // Assuming ₹1000 per conversion
        return ((revenue - campaign.spent) / campaign.spent) * 100;
    };

    const activeCampaigns = campaigns.filter((c) => c.status === "active");
    const totalBudget = campaigns.reduce((sum, c) => sum + c.budget, 0);
    const totalSpent = campaigns.reduce((sum, c) => sum + c.spent, 0);
    const totalConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0);

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Megaphone className="h-5 w-5" />
                        Advertising & Marketing
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Megaphone className="h-5 w-5" />
                            Advertising & Marketing
                        </CardTitle>
                        <CardDescription>
                            Platform recommendations and campaign tracking
                        </CardDescription>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Campaign
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Campaign</DialogTitle>
                                <DialogDescription>
                                    Track your advertising campaigns and ROI
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <Label>Platform</Label>
                                    <Select
                                        value={newCampaign.platform}
                                        onValueChange={(value) =>
                                            setNewCampaign({ ...newCampaign, platform: value })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select platform" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Google Ads">Google Ads</SelectItem>
                                            <SelectItem value="Facebook">Facebook</SelectItem>
                                            <SelectItem value="Instagram">Instagram</SelectItem>
                                            <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                                            <SelectItem value="YouTube">YouTube</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Campaign Name</Label>
                                    <Input
                                        value={newCampaign.campaign_name}
                                        onChange={(e) =>
                                            setNewCampaign({ ...newCampaign, campaign_name: e.target.value })
                                        }
                                        placeholder="Summer Sale 2024"
                                    />
                                </div>
                                <div>
                                    <Label>Budget (₹)</Label>
                                    <Input
                                        type="number"
                                        value={newCampaign.budget}
                                        onChange={(e) =>
                                            setNewCampaign({ ...newCampaign, budget: e.target.value })
                                        }
                                        placeholder="5000"
                                    />
                                </div>
                                <div>
                                    <Label>Start Date</Label>
                                    <Input
                                        type="date"
                                        value={newCampaign.start_date}
                                        onChange={(e) =>
                                            setNewCampaign({ ...newCampaign, start_date: e.target.value })
                                        }
                                    />
                                </div>
                                <Button onClick={handleAddCampaign} className="w-full">
                                    Add Campaign
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Campaign Stats */}
                {campaigns.length > 0 && (
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground">Total Budget</p>
                            <p className="text-2xl font-bold">₹{totalBudget.toLocaleString()}</p>
                        </div>
                        <div className="text-center p-3 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground">Spent</p>
                            <p className="text-2xl font-bold">₹{totalSpent.toLocaleString()}</p>
                        </div>
                        <div className="text-center p-3 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground">Conversions</p>
                            <p className="text-2xl font-bold">{totalConversions}</p>
                        </div>
                    </div>
                )}

                {/* Platform Recommendations */}
                <div>
                    <h4 className="font-semibold mb-3">Platform Recommendations</h4>
                    <div className="grid grid-cols-1 gap-3">
                        {platformRecommendations.map((rec) => (
                            <div
                                key={rec.platform}
                                className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                            >
                                <div className="flex items-start gap-3">
                                    <span className="text-2xl">{rec.icon}</span>
                                    <div className="flex-1">
                                        <h5 className="font-semibold">{rec.platform}</h5>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {rec.description}
                                        </p>
                                        <div className="flex items-center gap-4 mt-2">
                                            <span className="text-xs text-muted-foreground">
                                                Min: {rec.minBudget}
                                            </span>
                                            <div className="flex gap-1">
                                                {rec.bestFor.slice(0, 2).map((tag) => (
                                                    <Badge key={tag} variant="secondary" className="text-xs">
                                                        {tag}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Active Campaigns */}
                {activeCampaigns.length > 0 && (
                    <div>
                        <h4 className="font-semibold mb-3">Active Campaigns</h4>
                        <div className="space-y-2">
                            {activeCampaigns.map((campaign) => {
                                const roi = calculateROI(campaign);
                                return (
                                    <div
                                        key={campaign.id}
                                        className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div>
                                                <p className="font-medium">{campaign.campaign_name}</p>
                                                <p className="text-sm text-muted-foreground">{campaign.platform}</p>
                                            </div>
                                            <Badge variant={roi > 0 ? "default" : "secondary"}>
                                                ROI: {roi.toFixed(1)}%
                                            </Badge>
                                        </div>
                                        <div className="grid grid-cols-4 gap-2 text-sm">
                                            <div>
                                                <p className="text-muted-foreground">Budget</p>
                                                <p className="font-medium">₹{campaign.budget}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Spent</p>
                                                <p className="font-medium">₹{campaign.spent}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Clicks</p>
                                                <p className="font-medium">{campaign.clicks}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Conv.</p>
                                                <p className="font-medium">{campaign.conversions}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {campaigns.length === 0 && (
                    <div className="text-center py-8">
                        <Megaphone className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground">No campaigns yet</p>
                        <p className="text-sm text-muted-foreground mt-1">
                            Add your first campaign to start tracking ROI
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

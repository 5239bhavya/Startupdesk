import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Download,
  Copy,
  Trash2,
  Star,
  Clock,
  Loader2,
  ChevronDown,
  ChevronUp,
  Folder,
} from "lucide-react";
import html2canvas from "html2canvas";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface SavedAd {
  id: string;
  plan_id: string;
  plan_name: string;
  ad_type: string;
  headline: string;
  caption: string;
  cta: string;
  hashtags: string;
  suggested_time: string;
  is_favorite: boolean;
  created_at: string;
}

interface SavedAdsSectionProps {
  planId?: string; // Optional now, as we might show all ads
  userId: string;
}

export function SavedAdsSection({ planId, userId }: SavedAdsSectionProps) {
  const [ads, setAds] = useState<SavedAd[]>([]);
  const [groupedAds, setGroupedAds] = useState<Record<string, SavedAd[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadAds();
    }
  }, [planId, userId]);

  const loadAds = async () => {
    setIsLoading(true);
    try {
      // Fetch all ads for the user, regardless of plan
      // Note: The backend endpoint might need adjustment to handle "all" plans
      // For now, we'll try to fetch for the current plan if provided,
      // or we might need a new endpoint to get ALL user ads.
      // Let's assume we can pass a wildcard or specific query.

      // Hack: If we want ALL ads, we might need to change the backend endpoint
      // For now, let's use the existing endpoint but logic might be limited to current plan
      // proper implementation would be /api/get-user-ads?user_id=...

      let url = `http://127.0.0.1:5000/api/get-plan-ads/${planId || "all"}?user_id=${userId}`;

      // If planId is not provided, we should probably fetch all.
      // Since we don't have a "get all ads" endpoint ready, let's assume valid planId for now
      // OR we can update the backend to handle "all" keyword.

      const response = await fetch(url);

      if (!response.ok) throw new Error("Failed to load ads");

      const data = await response.json();
      if (data.success) {
        const fetchedAds = data.ads || [];
        setAds(fetchedAds);

        // Group ads by plan_name
        const grouped = fetchedAds.reduce(
          (acc: Record<string, SavedAd[]>, ad: SavedAd) => {
            const key = ad.plan_name || "Unknown Plan";
            if (!acc[key]) acc[key] = [];
            acc[key].push(ad);
            return acc;
          },
          {},
        );
        setGroupedAds(grouped);
      }
    } catch (error) {
      console.error("Error loading ads:", error);
      toast.error("Failed to load ads");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAd = async (adId: string) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/api/delete-plan-ad/${adId}?user_id=${userId}`,
        { method: "DELETE" },
      );

      if (!response.ok) throw new Error("Failed to delete ad");

      toast.success("Ad deleted successfully");
      await loadAds();
    } catch (error) {
      console.error("Error deleting ad:", error);
      toast.error("Failed to delete ad");
    }
  };

  const handleToggleFavorite = async (adId: string) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/api/toggle-favorite-ad/${adId}?user_id=${userId}`,
        { method: "PATCH" },
      );

      if (!response.ok) throw new Error("Failed to toggle favorite");

      await loadAds();
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error("Failed to update favorite");
    }
  };

  const handleDownloadImage = async (adId: string, headline: string) => {
    const element = document.getElementById(`saved-ad-${adId}`);
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        backgroundColor: "#ffffff",
        scale: 2,
      });

      const link = document.createElement("a");
      link.download = `${headline.replace(/\s+/g, "-").toLowerCase()}.png`;
      link.href = canvas.toDataURL();
      link.click();

      toast.success("Ad image downloaded!");
    } catch (error) {
      console.error("Error downloading image:", error);
      toast.error("Failed to download image");
    }
  };

  const handleCopyCaption = (ad: SavedAd) => {
    const fullText = `${ad.headline}\n\n${ad.caption}\n\n${ad.cta}\n\n${ad.hashtags}`;
    navigator.clipboard.writeText(fullText);
    toast.success("Caption copied to clipboard!");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (ads.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No saved ads found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Accordion type="single" collapsible className="w-full">
        {Object.entries(groupedAds).map(([planName, planAds], groupIndex) => (
          <AccordionItem key={groupIndex} value={`item-${groupIndex}`}>
            <AccordionTrigger className="text-lg font-semibold hover:no-underline">
              <div className="flex items-center gap-2">
                <Folder className="w-5 h-5 text-primary" />
                {planName}
                <Badge variant="secondary" className="ml-2">
                  {planAds.length}
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                {planAds.map((ad) => (
                  <Card
                    key={ad.id}
                    id={`saved-ad-${ad.id}`}
                    className="overflow-hidden border-2 hover:border-primary/20 transition-colors"
                  >
                    <CardHeader className="bg-gradient-to-br from-primary/10 to-primary/5 pb-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="bg-white/50">
                          {ad.ad_type}
                        </Badge>
                        {ad.is_favorite && (
                          <Star className="w-4 h-4 fill-yellow-500 text-yellow-500 drop-shadow-sm" />
                        )}
                      </div>
                      <CardTitle className="text-lg leading-tight min-h-[3rem] line-clamp-2">
                        {ad.headline}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                      <div className="min-h-[4rem]">
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {ad.caption}
                        </p>
                      </div>

                      <div className="p-3 bg-secondary/50 rounded-lg text-center">
                        <p className="font-semibold text-primary text-sm">
                          {ad.cta}
                        </p>
                      </div>

                      {ad.suggested_time && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
                          <Clock className="w-3 h-3" />
                          <span>Best time: {ad.suggested_time}</span>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() =>
                            handleDownloadImage(ad.id, ad.headline)
                          }
                        >
                          <Download className="w-3 h-3 mr-1" />
                          Image
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => handleCopyCaption(ad)}
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Copy
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleFavorite(ad.id)}
                          className={
                            ad.is_favorite
                              ? "bg-yellow-50 border-yellow-200"
                              : ""
                          }
                        >
                          <Star
                            className={`w-3 h-3 ${ad.is_favorite ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"}`}
                          />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAd(ad.id)}
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  ShoppingBag,
  Package,
  Globe,
  Plus,
  MapPin,
  IndianRupee,
  Phone,
  Calendar,
  User,
  Loader2,
  Search,
  Filter,
  Trash2,
  ShieldCheck,
} from "lucide-react";

interface Listing {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  listing_type: 'sell' | 'buy' | 'export';
  price_range: string | null;
  quantity: string | null;
  location: string;
  contact_info: string | null;
  status: string;
  created_at: string;
  is_gov_verified?: boolean;
}

const categories = [
  "Food & Beverages",
  "Electronics",
  "Clothing & Textiles",
  "Home & Kitchen",
  "Health & Beauty",
  "Agriculture",
  "Handicrafts",
  "Industrial",
  "Services",
  "Other",
];

const MarketplacePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    listing_type: "sell" as 'sell' | 'buy' | 'export',
    price_range: "",
    quantity: "",
    location: "",
    contact_info: "",
  });

  useEffect(() => {
    fetchListings();
  }, [activeTab, categoryFilter]);

  const fetchListings = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch user listings from Supabase
      let query = supabase
        .from('marketplace_listings')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (activeTab !== 'all') {
        query = query.eq('listing_type', activeTab);
      }

      if (categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter);
      }

      const { data: userData, error } = await query;
      if (error) throw error;

      let allListings = (userData || []) as Listing[];

      // 2. Fetch government listings from Flask backend (only if relevant filters apply)
      // Fetch for all tabs as we now map to buy (Raw Materials) and export (Partners) too
      if (['all', 'buy', 'export', 'sell'].includes(activeTab)) {
        try {
          const response = await fetch("http://127.0.0.1:5000/api/marketplace/gov-listings");
          if (response.ok) {
            const govData = await response.json();

            // Filter gov data based on tab logic
            // User Request:
            // - "For Sale" (sell) -> Show Manufacturers (sell)
            // - "Raw Materials" (buy) -> Show Manufacturers (sell) (Because buyers look for suppliers here)
            // - "Export" (export) -> Show Services (export)

            let relevantGovData = [];

            if (activeTab === 'all') {
              // Show EVERYTHING (Sell + Export)
              relevantGovData = govData;
            }
            else if (activeTab === 'sell') {
              // Show 'sell' type items (Manufacturers)
              relevantGovData = govData.filter((l: Listing) => l.listing_type === 'sell');
            }
            else if (activeTab === 'buy') {
              // "Raw Materials" tab: Show backend-mapped 'buy' items (Suppliers)
              relevantGovData = govData.filter((l: Listing) => l.listing_type === 'buy');
            }
            else if (activeTab === 'export') {
              // Show 'export' type items (Services)
              relevantGovData = govData.filter((l: Listing) => l.listing_type === 'export');
            }

            // Filter by category if needed
            if (categoryFilter !== 'all') {
              relevantGovData = relevantGovData.filter((l: Listing) => l.category === categoryFilter);
            }

            allListings = [...allListings, ...relevantGovData];
          }
        } catch (apiError) {
          console.error("Failed to fetch government listings", apiError);
        }
      }

      setListings(allListings);
    } catch (err) {
      console.error('Error fetching listings:', err);
      toast.error('Failed to load listings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Please sign in to create a listing');
      navigate('/auth');
      return;
    }

    if (!formData.title || !formData.description || !formData.category || !formData.location) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('marketplace_listings').insert([{
        user_id: user.id,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        listing_type: formData.listing_type,
        price_range: formData.price_range || null,
        quantity: formData.quantity || null,
        location: formData.location,
        contact_info: formData.contact_info || null,
      }]);

      if (error) throw error;

      toast.success('Listing created successfully!');
      setIsDialogOpen(false);
      setFormData({
        title: "",
        description: "",
        category: "",
        listing_type: "sell",
        price_range: "",
        quantity: "",
        location: "",
        contact_info: "",
      });
      fetchListings();
    } catch (err) {
      console.error('Error creating listing:', err);
      toast.error('Failed to create listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteListing = async (listingId: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;

    try {
      const { error } = await supabase
        .from('marketplace_listings')
        .delete()
        .eq('id', listingId);

      if (error) throw error;
      toast.success('Listing deleted');
      fetchListings();
    } catch (err) {
      console.error('Error deleting listing:', err);
      toast.error('Failed to delete listing');
    }
  };

  const filteredListings = listings.filter(listing =>
    listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    listing.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sell': return <ShoppingBag className="h-4 w-4" />;
      case 'buy': return <Package className="h-4 w-4" />;
      case 'export': return <Globe className="h-4 w-4" />;
      default: return <ShoppingBag className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'sell': return 'bg-success/10 text-success border-success/20';
      case 'buy': return 'bg-primary/10 text-primary border-primary/20';
      case 'export': return 'bg-warning/10 text-warning border-warning/20';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-8 px-4 bg-muted/20">
        <div className="container max-w-6xl">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {activeTab === 'sell' ? 'Marketplace: Finished Goods' :
                  activeTab === 'buy' ? 'Raw Materials & Supplies' :
                    activeTab === 'export' ? 'Export Partners' : 'Marketplace'}
              </h1>
              <p className="text-muted-foreground">
                {activeTab === 'sell' ? 'Buy finished goods directly from verified manufacturers.' :
                  activeTab === 'buy' ? 'Source raw materials and industrial supplies for your business.' :
                    activeTab === 'export' ? 'Connect with authorized export and logistics partners.' :
                      'Buy, sell, or export products. Connect with buyers and suppliers.'}
              </p>
            </div>
            <Button onClick={() => setIsDialogOpen(true)} className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Post Requirment
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search listings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={(val) => {
              setActiveTab(val);
              setCategoryFilter("all"); // Reset filter on tab change to avoid empty states
            }}
            className="space-y-6"
          >
            <TabsList>
              <TabsTrigger value="all">All Listings</TabsTrigger>
              <TabsTrigger value="sell" className="gap-2">
                <ShoppingBag className="h-4 w-4" />
                For Sale
              </TabsTrigger>
              <TabsTrigger value="buy" className="gap-2">
                <Package className="h-4 w-4" />
                Raw Materials
              </TabsTrigger>
              <TabsTrigger value="export" className="gap-2">
                <Globe className="h-4 w-4" />
                Export Partners
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              {isLoading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-4">
                        <div className="h-6 bg-muted rounded w-3/4 mb-3" />
                        <div className="h-4 bg-muted rounded w-full mb-2" />
                        <div className="h-4 bg-muted rounded w-2/3" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredListings.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="p-12 text-center">
                    <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="font-semibold mb-2">No listings found</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Be the first to create a listing in this category!
                    </p>
                    <Button onClick={() => setIsDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Listing
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredListings.map((listing) => (
                    <Card key={listing.id} className="group hover:shadow-lg transition-all duration-200 border-muted/60 bg-white">
                      <CardContent className="p-0">
                        {/* Card Header Section */}
                        <div className="p-5 border-b bg-muted/5">
                          <div className="flex items-start justify-between mb-2">
                            <Badge variant="secondary" className="bg-white border-muted-foreground/20 text-muted-foreground hover:bg-white text-xs font-normal">
                              {listing.category}
                            </Badge>
                            {listing.is_gov_verified && (
                              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] uppercase tracking-wider font-semibold rounded-full border border-blue-100">
                                <ShieldCheck className="w-3 h-3" />
                                Verified
                              </div>
                            )}
                          </div>
                          <h3 className="font-bold text-lg leading-tight text-foreground group-hover:text-primary transition-colors">
                            {listing.title.replace(/^(Supplier: |Manufacturer: |Export Partner: )/, '')}
                          </h3>
                          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground/80 font-medium uppercase tracking-wide">
                            {listing.title.startsWith("Supplier:") && "🏭 Industrial Supplier"}
                            {listing.title.startsWith("Manufacturer:") && "🛠️ Manufacturer"}
                            {listing.title.startsWith("Export Partner:") && "🚢 Export Partner"}
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-5 space-y-4">
                          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                            {listing.description}
                          </p>

                          <div className="grid grid-cols-2 gap-y-2 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <MapPin className="h-4 w-4 text-primary/70" />
                              <span className="truncate">{listing.location}</span>
                            </div>
                            {listing.price_range && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <IndianRupee className="h-4 w-4 text-primary/70" />
                                <span>{listing.price_range}</span>
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="pt-2">
                            {listing.contact_info && (
                              <Button className="w-full bg-primary hover:bg-primary/90 text-white shadow-sm font-medium h-10 transition-all duration-200">
                                {listing.is_gov_verified ? "Inquiry Official Record" : "Contact Supplier"}
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />

      {/* Create Listing Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Listing</DialogTitle>
            <DialogDescription>
              Post your product for sale, request to buy, or list for export.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>Listing Type *</Label>
              <div className="flex gap-2 mt-2">
                {(['sell', 'buy', 'export'] as const).map((type) => (
                  <Button
                    key={type}
                    type="button"
                    variant={formData.listing_type === type ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFormData({ ...formData, listing_type: type })}
                    className="flex-1 capitalize"
                  >
                    {getTypeIcon(type)}
                    <span className="ml-2">{type}</span>
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label>Title *</Label>
              <Input
                placeholder="e.g., Fresh Organic Vegetables"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div>
              <Label>Description *</Label>
              <Textarea
                placeholder="Describe your product or requirements..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div>
              <Label>Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(v) => setFormData({ ...formData, category: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Price Range</Label>
                <Input
                  placeholder="e.g., ₹500-₹1,000"
                  value={formData.price_range}
                  onChange={(e) => setFormData({ ...formData, price_range: e.target.value })}
                />
              </div>
              <div>
                <Label>Quantity</Label>
                <Input
                  placeholder="e.g., 100 kg"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label>Location *</Label>
              <Input
                placeholder="e.g., Mumbai, Maharashtra"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>

            <div>
              <Label>Contact Info</Label>
              <Input
                placeholder="Phone number or email"
                value={formData.contact_info}
                onChange={(e) => setFormData({ ...formData, contact_info: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Listing'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MarketplacePage;

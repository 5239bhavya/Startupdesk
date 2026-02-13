import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
    TrendingUp,
    Plus,
    DollarSign,
    Loader2,
    Calendar,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface Sale {
    id: string;
    date: string;
    amount: number;
    product_service: string;
    category: string;
    customer_name: string;
}

export const SalesWidget = () => {
    const { user } = useAuth();
    const [sales, setSales] = useState<Sale[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newSale, setNewSale] = useState({
        date: new Date().toISOString().split("T")[0],
        amount: "",
        product_service: "",
        category: "",
        customer_name: "",
    });

    useEffect(() => {
        if (user) {
            loadSales();
        }
    }, [user]);

    const loadSales = async () => {
        try {
            const { data, error } = await supabase
                .from("sales_tracking")
                .select("*")
                .eq("user_id", user?.id)
                .order("date", { ascending: false })
                .limit(10);

            if (error) throw error;
            setSales(data || []);
        } catch (error) {
            console.error("Error loading sales:", error);
            toast.error("Failed to load sales");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddSale = async () => {
        if (!newSale.amount || !newSale.product_service) {
            toast.error("Please fill required fields");
            return;
        }

        try {
            const { error } = await supabase.from("sales_tracking").insert({
                user_id: user?.id,
                date: newSale.date,
                amount: parseFloat(newSale.amount),
                product_service: newSale.product_service,
                category: newSale.category,
                customer_name: newSale.customer_name,
            });

            if (error) throw error;

            toast.success("Sale added successfully!");
            setIsDialogOpen(false);
            setNewSale({
                date: new Date().toISOString().split("T")[0],
                amount: "",
                product_service: "",
                category: "",
                customer_name: "",
            });
            loadSales();
        } catch (error) {
            console.error("Error adding sale:", error);
            toast.error("Failed to add sale");
        }
    };

    const totalRevenue = sales.reduce((sum, sale) => sum + sale.amount, 0);
    const thisMonthSales = sales.filter(
        (s) => new Date(s.date).getMonth() === new Date().getMonth()
    );
    const thisMonthRevenue = thisMonthSales.reduce((sum, sale) => sum + sale.amount, 0);

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Sales Tracking
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
                            <TrendingUp className="h-5 w-5" />
                            Sales Tracking
                        </CardTitle>
                        <CardDescription>Track your revenue and transactions</CardDescription>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Sale
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Sale</DialogTitle>
                                <DialogDescription>Record a new sales transaction</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <Label>Date</Label>
                                    <Input
                                        type="date"
                                        value={newSale.date}
                                        onChange={(e) => setNewSale({ ...newSale, date: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>Amount (₹) *</Label>
                                    <Input
                                        type="number"
                                        value={newSale.amount}
                                        onChange={(e) => setNewSale({ ...newSale, amount: e.target.value })}
                                        placeholder="5000"
                                    />
                                </div>
                                <div>
                                    <Label>Product/Service *</Label>
                                    <Input
                                        value={newSale.product_service}
                                        onChange={(e) =>
                                            setNewSale({ ...newSale, product_service: e.target.value })
                                        }
                                        placeholder="Product name or service"
                                    />
                                </div>
                                <div>
                                    <Label>Category</Label>
                                    <Input
                                        value={newSale.category}
                                        onChange={(e) => setNewSale({ ...newSale, category: e.target.value })}
                                        placeholder="Electronics, Services, etc."
                                    />
                                </div>
                                <div>
                                    <Label>Customer Name</Label>
                                    <Input
                                        value={newSale.customer_name}
                                        onChange={(e) =>
                                            setNewSale({ ...newSale, customer_name: e.target.value })
                                        }
                                        placeholder="Customer name"
                                    />
                                </div>
                                <Button onClick={handleAddSale} className="w-full">
                                    Add Sale
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Revenue Summary */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                        <p className="text-sm text-muted-foreground mb-1">This Month</p>
                        <p className="text-2xl font-bold text-primary">
                            ₹{thisMonthRevenue.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {thisMonthSales.length} transactions
                        </p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
                        <p className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {sales.length} total sales
                        </p>
                    </div>
                </div>

                {/* Recent Sales */}
                <div>
                    <h4 className="font-semibold mb-3">Recent Sales</h4>
                    {sales.length > 0 ? (
                        <div className="space-y-2">
                            {sales.slice(0, 5).map((sale) => (
                                <div
                                    key={sale.id}
                                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex-1">
                                        <p className="font-medium">{sale.product_service}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <p className="text-sm text-muted-foreground">
                                                {new Date(sale.date).toLocaleDateString()}
                                            </p>
                                            {sale.category && (
                                                <>
                                                    <span className="text-muted-foreground">•</span>
                                                    <p className="text-sm text-muted-foreground">{sale.category}</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-green-600">
                                            ₹{sale.amount.toLocaleString()}
                                        </p>
                                        {sale.customer_name && (
                                            <p className="text-xs text-muted-foreground">{sale.customer_name}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                            <p className="text-muted-foreground">No sales recorded yet</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Add your first sale to start tracking revenue
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

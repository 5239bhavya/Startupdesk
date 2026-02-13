import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
    Wallet,
    Plus,
    TrendingUp,
    TrendingDown,
    Loader2,
    ArrowUpCircle,
    ArrowDownCircle,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface Transaction {
    id: string;
    date: string;
    type: "income" | "expense";
    amount: number;
    category: string;
    description: string;
}

export const CashFlowWidget = () => {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newTransaction, setNewTransaction] = useState({
        date: new Date().toISOString().split("T")[0],
        type: "income" as "income" | "expense",
        amount: "",
        category: "",
        description: "",
    });

    useEffect(() => {
        if (user) {
            loadTransactions();
        }
    }, [user]);

    const loadTransactions = async () => {
        try {
            const { data, error } = await supabase
                .from("cash_flow")
                .select("*")
                .eq("user_id", user?.id)
                .order("date", { ascending: false })
                .limit(10);

            if (error) throw error;
            setTransactions(data || []);
        } catch (error) {
            console.error("Error loading transactions:", error);
            toast.error("Failed to load cash flow");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddTransaction = async () => {
        if (!newTransaction.amount || !newTransaction.category) {
            toast.error("Please fill required fields");
            return;
        }

        try {
            const { error } = await supabase.from("cash_flow").insert({
                user_id: user?.id,
                date: newTransaction.date,
                type: newTransaction.type,
                amount: parseFloat(newTransaction.amount),
                category: newTransaction.category,
                description: newTransaction.description,
            });

            if (error) throw error;

            toast.success("Transaction added successfully!");
            setIsDialogOpen(false);
            setNewTransaction({
                date: new Date().toISOString().split("T")[0],
                type: "income",
                amount: "",
                category: "",
                description: "",
            });
            loadTransactions();
        } catch (error) {
            console.error("Error adding transaction:", error);
            toast.error("Failed to add transaction");
        }
    };

    const totalIncome = transactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpenses;

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Wallet className="h-5 w-5" />
                        Cash Flow
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
                            <Wallet className="h-5 w-5" />
                            Cash Flow
                        </CardTitle>
                        <CardDescription>Track income and expenses</CardDescription>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Transaction
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add Transaction</DialogTitle>
                                <DialogDescription>Record income or expense</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <Label>Type</Label>
                                    <Select
                                        value={newTransaction.type}
                                        onValueChange={(value: "income" | "expense") =>
                                            setNewTransaction({ ...newTransaction, type: value })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="income">Income</SelectItem>
                                            <SelectItem value="expense">Expense</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Date</Label>
                                    <Input
                                        type="date"
                                        value={newTransaction.date}
                                        onChange={(e) =>
                                            setNewTransaction({ ...newTransaction, date: e.target.value })
                                        }
                                    />
                                </div>
                                <div>
                                    <Label>Amount (₹) *</Label>
                                    <Input
                                        type="number"
                                        value={newTransaction.amount}
                                        onChange={(e) =>
                                            setNewTransaction({ ...newTransaction, amount: e.target.value })
                                        }
                                        placeholder="5000"
                                    />
                                </div>
                                <div>
                                    <Label>Category *</Label>
                                    <Input
                                        value={newTransaction.category}
                                        onChange={(e) =>
                                            setNewTransaction({ ...newTransaction, category: e.target.value })
                                        }
                                        placeholder="Salary, Rent, Marketing, etc."
                                    />
                                </div>
                                <div>
                                    <Label>Description</Label>
                                    <Input
                                        value={newTransaction.description}
                                        onChange={(e) =>
                                            setNewTransaction({ ...newTransaction, description: e.target.value })
                                        }
                                        placeholder="Optional notes"
                                    />
                                </div>
                                <Button onClick={handleAddTransaction} className="w-full">
                                    Add Transaction
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Balance Summary */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-muted rounded-lg text-center">
                        <p className="text-sm text-muted-foreground mb-1">Balance</p>
                        <p className={`text-2xl font-bold ${balance >= 0 ? "text-green-600" : "text-red-600"}`}>
                            ₹{balance.toLocaleString()}
                        </p>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg text-center border border-green-200 dark:border-green-800">
                        <p className="text-sm text-green-700 dark:text-green-300 mb-1">Income</p>
                        <p className="text-2xl font-bold text-green-600">
                            ₹{totalIncome.toLocaleString()}
                        </p>
                    </div>
                    <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg text-center border border-red-200 dark:border-red-800">
                        <p className="text-sm text-red-700 dark:text-red-300 mb-1">Expenses</p>
                        <p className="text-2xl font-bold text-red-600">
                            ₹{totalExpenses.toLocaleString()}
                        </p>
                    </div>
                </div>

                {/* Recent Transactions */}
                <div>
                    <h4 className="font-semibold mb-3">Recent Transactions</h4>
                    {transactions.length > 0 ? (
                        <div className="space-y-2">
                            {transactions.slice(0, 5).map((transaction) => (
                                <div
                                    key={transaction.id}
                                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        {transaction.type === "income" ? (
                                            <ArrowUpCircle className="h-5 w-5 text-green-500" />
                                        ) : (
                                            <ArrowDownCircle className="h-5 w-5 text-red-500" />
                                        )}
                                        <div>
                                            <p className="font-medium">{transaction.category}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {new Date(transaction.date).toLocaleDateString()}
                                                {transaction.description && ` • ${transaction.description}`}
                                            </p>
                                        </div>
                                    </div>
                                    <p
                                        className={`font-bold ${transaction.type === "income" ? "text-green-600" : "text-red-600"
                                            }`}
                                    >
                                        {transaction.type === "income" ? "+" : "-"}₹
                                        {transaction.amount.toLocaleString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                            <p className="text-muted-foreground">No transactions yet</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Add your first transaction to track cash flow
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

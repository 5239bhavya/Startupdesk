import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Send, User, Loader2, RefreshCw, LayoutDashboard, ShoppingCart, Menu, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { chatService, ChatSession, Message, AgentState } from "@/services/chatService";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const SmartBizAgent = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [state, setState] = useState<AgentState | null>(null);
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [comparisonData, setComparisonData] = useState<any[]>([]);

  // Chat History State
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Load chat sessions on mount
  useEffect(() => {
    const sessions = chatService.getAllChats();
    setChatSessions(sessions);

    const savedCurrentId = localStorage.getItem("smartbiz-current-chat-id");

    if (savedCurrentId && sessions.some(s => s.id === savedCurrentId)) {
      loadChatSession(savedCurrentId);
    } else if (sessions.length > 0) {
      // Load the most recent chat if available
      loadChatSession(sessions[0].id);
    } else {
      // Start a new chat if no history
      handleNewChat();
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
    // Focus input when not loading
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [messages, isLoading]);

  // Persist current session whenever it changes
  useEffect(() => {
    if (currentSessionId && messages.length > 0) {
      const currentSession: ChatSession = {
        id: currentSessionId,
        title: chatService.generateTitle(messages.find(m => m.role === "user")?.content || "New Conversation"),
        messages,
        state: state || { step_index: 0, answers: {} },
        lastUpdated: Date.now(),
        createdAt: Date.now() // formatting will handle if this is overwritten, but service handles updates correctly
      };

      chatService.saveChat(currentSession);
      setChatSessions(chatService.getAllChats()); // Refresh list
      localStorage.setItem("smartbiz-current-chat-id", currentSessionId);
    }
  }, [messages, state, currentSessionId]);

  const loadChatSession = (id: string) => {
    const session = chatService.getChat(id);
    if (session) {
      setCurrentSessionId(session.id);
      setMessages(session.messages);
      setState(session.state);
      // setComparisonData([]); // Reset comparison data as it's not stored in session currently (optional: add to session)
      localStorage.setItem("smartbiz-current-chat-id", session.id);

      // Close mobile sidebar if open
      setSidebarOpen(false);
    }
  };

  const handleNewChat = () => {
    const newSession = chatService.createNewChat();
    setCurrentSessionId(newSession.id);
    setMessages([]);
    setState(newSession.state);
    setComparisonData([]);
    localStorage.setItem("smartbiz-current-chat-id", newSession.id);

    // Initial greeting for new chat
    sendMessage("", newSession.state);

    setSidebarOpen(false);
  };

  const handleDeleteChat = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    chatService.deleteChat(id);
    const updatedSessions = chatService.getAllChats();
    setChatSessions(updatedSessions);

    if (currentSessionId === id) {
      if (updatedSessions.length > 0) {
        loadChatSession(updatedSessions[0].id);
      } else {
        handleNewChat();
      }
    }
  };

  const sendMessage = async (message: string, currentStateOverride?: AgentState) => {
    setIsLoading(true);
    try {
      const currentState = currentStateOverride || state;

      // Don't send empty message unless it's the initial trigger
      if (!message && messages.length > 0) {
        setIsLoading(false);
        return;
      }

      const response = await fetch("http://127.0.0.1:5000/api/smartbiz-agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: message,
          state: currentState,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to connect to AI agent backend");
      }

      const data = await response.json();

      const newMessages: Message[] = [];
      if (message) {
        newMessages.push({ role: "user", content: message });
      }
      newMessages.push({ role: "agent", content: data.reply });

      setMessages((prev) => [...prev, ...newMessages]);
      setState(data.state);
      if (data.comparison_data && data.comparison_data.length > 0) {
        setComparisonData(data.comparison_data);
      }
    } catch (error) {
      console.error("Error calling AI agent:", error);
      const errorMessage = error instanceof Error ? error.message : "Connection failed";
      toast.error(`AI Agent Error: ${errorMessage}. Please check if the backend is running and the API key is valid.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    sendMessage(userMessage);
  };

  const handleReset = () => {
    handleNewChat();
  };

  const handleViewDashboard = () => {
    if (!state) return;

    const answers = state.answers;

    // Create a mock user profile based on AI answers
    const userProfile = {
      budget: answers["ASK_BUDGET"] || "Not specified",
      city: answers["ASK_CUSTOM_LOCATION"] || "Not specified",
      interest: answers["ASK_IDEA"] || "Not specified",
      experience: "beginner"
    };

    // Create a mock business idea based on AI answers
    const businessIdea = {
      id: "ai-generated",
      name: answers["ASK_IDEA"] || "My Business",
      description: `New business idea generated with SmartBiz AI in ${userProfile.city}.`,
      investmentRange: userProfile.budget,
      expectedRevenue: "TBD",
      profitMargin: "TBD",
      riskLevel: "Medium",
      breakEvenTime: "TBD",
      icon: "🚀"
    };

    // Map AI advice to BusinessPlan structure
    const businessPlan = {
      idea: businessIdea,
      rawMaterials: (answers["RAW_MATERIALS"] || "").split("\n").map(m => ({
        name: m.trim(),
        sourceType: "Industrial Hubs",
        estimatedCost: "Market Price",
        tips: "Search on IndiaMART or local mandis."
      })).filter(m => m.name.length > 0),
      workforce: [
        { role: "Owner/Manager", skillLevel: "Skilled", count: 1, estimatedSalary: "N/A" }
      ],
      location: {
        areaType: answers["ASK_LOCATION_PREFERENCE"] || "Not specified",
        shopSize: "Approx 100-200 sq.ft.",
        rentEstimate: "Depends on local market",
        setupNeeds: ["Basic infrastructure", "Utilities connection", "Signage"]
      },
      pricing: {
        costComponents: ["Rent", "Raw Materials", "Labor"],
        costPrice: "TBD",
        marketPriceRange: "TBD",
        suggestedPrice: "TBD",
        profitMargin: "TBD"
      },
      marketing: {
        launchPlan: ["Social media announcement", "Inauguration offer"],
        onlineStrategies: ["WhatsApp Business", "Google My Business Listing"],
        offlineStrategies: ["Local flyers", "Networking"],
        lowBudgetIdeas: ["Referral program", "Early bird discounts"]
      },
      growth: {
        month1to3: ["Streamlining operations", "Building customer base"],
        month4to6: ["Marketing expansion", "Improving product/service"],
        expansionIdeas: ["New locations", "Franchise model"],
        mistakesToAvoid: ["Over-investing early", "Ignoring customer feedback"]
      }
    };

    // Store in sessionStorage to mimic the BusinessPlanPage expectations
    sessionStorage.setItem("selectedBusiness", JSON.stringify(businessIdea));
    sessionStorage.setItem("userProfile", JSON.stringify(userProfile));
    sessionStorage.setItem("loadedPlan", JSON.stringify(businessPlan));

    navigate("/plan");
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <main className="flex-1 container max-w-7xl py-4 md:py-8 flex gap-4 h-[calc(100vh-64px)]">

        {/* Desktop Sidebar */}
        <div className="hidden md:block w-72 bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden h-full">
          <ChatSidebar
            sessions={chatSessions}
            currentSessionId={currentSessionId}
            onSelectSession={(s) => loadChatSession(s.id)}
            onNewChat={handleNewChat}
            onDeleteChat={handleDeleteChat}
          />
        </div>

        {/* Main Chat Area */}
        <Card className="flex-1 flex flex-col shadow-lg border-primary/10 h-full overflow-hidden">
          <CardHeader className="bg-primary text-primary-foreground rounded-t-lg flex flex-row items-center justify-between py-3">
            <div className="flex items-center gap-3">
              {/* Mobile Sidebar Trigger */}
              <div className="md:hidden">
                <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10">
                      <Menu className="w-5 h-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="p-0">
                    <ChatSidebar
                      sessions={chatSessions}
                      currentSessionId={currentSessionId}
                      onSelectSession={(s) => loadChatSession(s.id)}
                      onNewChat={handleNewChat}
                      onDeleteChat={handleDeleteChat}
                    />
                  </SheetContent>
                </Sheet>
              </div>

              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Bot className="w-5 h-5" />
                  SmartBiz AI
                </CardTitle>
                <CardDescription className="text-primary-foreground/80 text-xs hidden sm:block">
                  Intelligent Business Startup Advisor
                </CardDescription>
              </div>
            </div>

            <Button
              variant="outline"
              size="icon"
              className="bg-transparent border-primary-foreground/20 hover:bg-primary-foreground/10 text-primary-foreground"
              onClick={handleNewChat}
              title="Start New Chat"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </CardHeader>

          <CardContent className="flex-1 p-0 overflow-hidden relative">
            <ScrollArea className="h-full p-4">
              <div className="space-y-4 pb-4">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                  >
                    <div
                      className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-2 ${msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-none"
                        : "bg-muted text-foreground rounded-tl-none border border-slate-200"
                        }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {msg.role === "agent" ? (
                          <Bot className="w-3 h-3 text-primary" />
                        ) : (
                          <User className="w-3 h-3 text-primary-foreground" />
                        )}
                        <span className="text-[10px] uppercase font-bold tracking-wider opacity-70">
                          {msg.role === "agent" ? "SmartBiz AI" : "You"}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap text-sm md:text-base">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted text-foreground rounded-2xl rounded-tl-none px-4 py-3 border border-slate-200">
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {state?.step_index === 6 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 animate-in fade-in slide-in-from-bottom-2 z-10">
                <Button
                  onClick={() => setComparisonOpen(true)}
                  variant="outline"
                  className="gap-2 border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100 hover:text-amber-800 shadow-lg"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Compare Listed Suppliers
                </Button>
              </div>
            )}

            {state?.step_index === 12 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 animate-in fade-in slide-in-from-bottom-2 z-10">
                <Button onClick={handleViewDashboard} className="gap-2 shadow-lg">
                  <LayoutDashboard className="w-4 h-4" />
                  Customize & View My Dashboard
                </Button>
              </div>
            )}
          </CardContent>

          <CardFooter className="p-3 md:p-4 bg-slate-50 border-t">
            <form onSubmit={handleSubmit} className="flex w-full gap-2">
              <Input
                ref={inputRef}
                placeholder="Type your answer here..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                className="flex-1"
                autoFocus
              />
              <Button type="submit" disabled={isLoading || !input.trim()}>
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </form>
          </CardFooter>
        </Card>
      </main>

      {/* Supplier Comparison Modal */}
      <Dialog open={comparisonOpen} onOpenChange={setComparisonOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="text-primary" />
              Supplier & Raw Material Comparison
            </DialogTitle>
            <DialogDescription>
              Comparing top verified suppliers based on current MSME and marketplace data.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-muted text-muted-foreground uppercase text-[10px] font-bold tracking-wider">
                  <th className="p-3 text-left border">Supplier Name</th>
                  <th className="p-3 text-left border">Quality Rating</th>
                  <th className="p-3 text-left border">Price Index</th>
                  <th className="p-3 text-left border">Special Offers</th>
                  <th className="p-3 text-left border">Verification</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.length > 0 ? (
                  comparisonData.map((s, i) => (
                    <tr key={i} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3 border font-medium">{s.name}</td>
                      <td className="p-3 border">
                        <div className="flex items-center gap-1">
                          <span className="text-amber-500 font-bold">★★★★</span>
                          <span className="text-xs">{s.quality}</span>
                        </div>
                      </td>
                      <td className="p-3 border">
                        <Badge variant={s.price === "Cheapest" ? "secondary" : "outline"} className={s.price === "Cheapest" ? "bg-green-100 text-green-800" : ""}>
                          {s.price}
                        </Badge>
                      </td>
                      <td className="p-3 border text-xs italic">{s.offer}</td>
                      <td className="p-3 border">
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                          {s.status}
                        </Badge>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground italic">
                      No comparison data available yet. Please ask the agent to list suppliers first.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <DialogFooter>
            <Button onClick={() => setComparisonOpen(false)}>Close Comparison</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SmartBizAgent;

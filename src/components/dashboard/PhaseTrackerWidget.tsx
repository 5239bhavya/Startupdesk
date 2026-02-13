import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
    Target,
    CheckCircle2,
    Circle,
    Lightbulb,
    Rocket,
    TrendingUp,
    Zap,
    Loader2,
} from "lucide-react";

interface Milestone {
    id: string;
    phase: string;
    milestone_name: string;
    description: string;
    completed: boolean;
    order_index: number;
}

const phaseIcons = {
    idea: Lightbulb,
    launch: Rocket,
    growth: TrendingUp,
    scale: Zap,
};

const phaseColors = {
    idea: "bg-blue-500",
    launch: "bg-green-500",
    growth: "bg-orange-500",
    scale: "bg-purple-500",
};

const phaseLabels = {
    idea: "Idea Phase",
    launch: "Launch Phase",
    growth: "Growth Phase",
    scale: "Scale Phase",
};

export const PhaseTrackerWidget = () => {
    const { user } = useAuth();
    const [milestones, setMilestones] = useState<Milestone[]>([]);
    const [currentPhase, setCurrentPhase] = useState<string>("idea");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user) {
            loadMilestones();
        }
    }, [user]);

    const loadMilestones = async () => {
        try {
            const { data, error } = await supabase
                .from("business_milestones")
                .select("*")
                .eq("user_id", user?.id)
                .order("phase")
                .order("order_index");

            if (error) throw error;

            setMilestones(data || []);
            determineCurrentPhase(data || []);
        } catch (error) {
            console.error("Error loading milestones:", error);
            toast.error("Failed to load milestones");
        } finally {
            setIsLoading(false);
        }
    };

    const determineCurrentPhase = (allMilestones: Milestone[]) => {
        const phases = ["idea", "launch", "growth", "scale"];

        for (const phase of phases) {
            const phaseMilestones = allMilestones.filter((m) => m.phase === phase);
            const completed = phaseMilestones.filter((m) => m.completed).length;

            if (completed < phaseMilestones.length) {
                setCurrentPhase(phase);
                return;
            }
        }

        setCurrentPhase("scale");
    };

    const toggleMilestone = async (milestoneId: string, completed: boolean) => {
        try {
            const { error } = await supabase
                .from("business_milestones")
                .update({
                    completed,
                    completed_date: completed ? new Date().toISOString() : null
                })
                .eq("id", milestoneId);

            if (error) throw error;

            // Update local state
            setMilestones((prev) =>
                prev.map((m) => (m.id === milestoneId ? { ...m, completed } : m))
            );

            // Recalculate current phase
            const updated = milestones.map((m) =>
                m.id === milestoneId ? { ...m, completed } : m
            );
            determineCurrentPhase(updated);

            if (completed) {
                toast.success("Milestone completed! 🎉");
            }
        } catch (error) {
            console.error("Error updating milestone:", error);
            toast.error("Failed to update milestone");
        }
    };

    const calculatePhaseProgress = (phase: string) => {
        const phaseMilestones = milestones.filter((m) => m.phase === phase);
        if (phaseMilestones.length === 0) return 0;

        const completed = phaseMilestones.filter((m) => m.completed).length;
        return Math.round((completed / phaseMilestones.length) * 100);
    };

    const currentPhaseMilestones = milestones.filter((m) => m.phase === currentPhase);
    const overallProgress = Math.round(
        (milestones.filter((m) => m.completed).length / milestones.length) * 100
    );

    const PhaseIcon = phaseIcons[currentPhase as keyof typeof phaseIcons];

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Business Phase Tracker
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
                <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Business Phase Tracker
                </CardTitle>
                <CardDescription>
                    Track your progress through business phases
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Current Phase Indicator */}
                <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                    <div className={`p-3 rounded-full ${phaseColors[currentPhase as keyof typeof phaseColors]}`}>
                        <PhaseIcon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-lg">
                            {phaseLabels[currentPhase as keyof typeof phaseLabels]}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            {calculatePhaseProgress(currentPhase)}% Complete
                        </p>
                    </div>
                    <Badge variant="secondary">{overallProgress}% Overall</Badge>
                </div>

                {/* Phase Progress Bars */}
                <div className="space-y-3">
                    {Object.keys(phaseLabels).map((phase) => {
                        const progress = calculatePhaseProgress(phase);
                        const Icon = phaseIcons[phase as keyof typeof phaseIcons];
                        const isActive = phase === currentPhase;

                        return (
                            <div key={phase} className={`space-y-1 ${isActive ? "" : "opacity-60"}`}>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="flex items-center gap-2">
                                        <Icon className="h-4 w-4" />
                                        {phaseLabels[phase as keyof typeof phaseLabels]}
                                    </span>
                                    <span className="text-muted-foreground">{progress}%</span>
                                </div>
                                <Progress value={progress} className="h-2" />
                            </div>
                        );
                    })}
                </div>

                {/* Current Phase Milestones */}
                <div>
                    <h4 className="font-semibold mb-3">Current Milestones</h4>
                    <div className="space-y-2">
                        {currentPhaseMilestones.map((milestone) => (
                            <div
                                key={milestone.id}
                                className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                            >
                                <Checkbox
                                    checked={milestone.completed}
                                    onCheckedChange={(checked) =>
                                        toggleMilestone(milestone.id, checked as boolean)
                                    }
                                    className="mt-1"
                                />
                                <div className="flex-1">
                                    <p className={`font-medium ${milestone.completed ? "line-through text-muted-foreground" : ""}`}>
                                        {milestone.milestone_name}
                                    </p>
                                    {milestone.description && (
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {milestone.description}
                                        </p>
                                    )}
                                </div>
                                {milestone.completed && (
                                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Next Steps */}
                {overallProgress < 100 && (
                    <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                            <Zap className="h-4 w-4 text-primary" />
                            Next Steps
                        </h4>
                        <p className="text-sm text-muted-foreground">
                            Complete the remaining milestones in the {phaseLabels[currentPhase as keyof typeof phaseLabels]}
                            {" "}to progress to the next phase.
                        </p>
                    </div>
                )}

                {overallProgress === 100 && (
                    <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2 text-green-700 dark:text-green-300">
                            <CheckCircle2 className="h-4 w-4" />
                            Congratulations! 🎉
                        </h4>
                        <p className="text-sm text-green-600 dark:text-green-400">
                            You've completed all business phases! Keep growing and scaling your business.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

import { Lightbulb } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Lightbulb className="h-4 w-4" />
            </div>
            <span className="font-semibold">SmartBiz AI</span>
          </div>
          
          <p className="text-sm text-muted-foreground text-center">
            AI-Powered Business Planning for Small Businesses & Startups
          </p>
          
          <p className="text-sm text-muted-foreground">
            © 2025 SmartBiz AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

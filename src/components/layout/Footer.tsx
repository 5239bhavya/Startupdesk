import { Lightbulb, Twitter, Linkedin, Instagram } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/6 bg-glass-frosted">
      <div className="container py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary text-primary-foreground shadow-glow">
                <Lightbulb className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold gradient-text">SmartBiz AI</div>
                <p className="text-sm text-muted-foreground">AI business planning & growth for startups</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="mb-3 font-semibold">Product</h4>
            <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
              <li>Business Plans</li>
              <li>AI Advisor</li>
              <li>Market Research</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 font-semibold">Company</h4>
            <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
              <li>About</li>
              <li>Careers</li>
              <li>Contact</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 font-semibold">Follow Us</h4>
            <div className="flex items-center gap-3">
              <button className="p-2 rounded-md bg-background/20 hover:bg-background/30">
                <Twitter className="h-4 w-4" />
              </button>
              <button className="p-2 rounded-md bg-background/20 hover:bg-background/30">
                <Linkedin className="h-4 w-4" />
              </button>
              <button className="p-2 rounded-md bg-background/20 hover:bg-background/30">
                <Instagram className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">© 2026 SmartBiz AI. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { EditableText } from './EditableText';
import { Logo } from '@/components/ui/Logo';
import { useState } from 'react';
import { AboutDialog } from './AboutDialog';
import { HowItWorksDialog } from './HowItWorksDialog';


export function Navbar({ isEditingGlobal = false, updateContent }: { isEditingGlobal?: boolean; updateContent?: (path: string, val: any) => void; profile?: any }) {
  const [aboutOpen, setAboutOpen] = useState(false);
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="container grid grid-cols-2 md:grid-cols-3 items-center h-16">
        {/* Logo aligned with container */}
        <div className="flex justify-start">
          <Link to="/" className="flex items-center">
            <Logo size="lg" className="-ml-12" textClassName="font-semibold" />
          </Link>
        </div>

        {/* Centered Navigation */}
        <div className="hidden md:flex items-center justify-center gap-8">
          <NavLink href="#features">Features</NavLink>
          <button
            onClick={() => setHowItWorksOpen(true)}
            className="text-muted-foreground hover:text-foreground transition-colors font-medium">
            How It Works
          </button>
          <button
            onClick={() => setAboutOpen(true)}
            className="text-muted-foreground hover:text-foreground transition-colors font-medium">
            About
          </button>
        </div>

        {/* Login inside container boundary */}
        <div className="flex justify-end items-center gap-4">
          <Link to="/login">
            <Button className="gradient-hero shadow-glow hover:scale-105 transition-transform">
              Log In
            </Button>
          </Link>
        </div>
      </div>

      <AboutDialog open={aboutOpen} onOpenChange={setAboutOpen} />
      <HowItWorksDialog open={howItWorksOpen} onOpenChange={setHowItWorksOpen} />
    </nav>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="text-muted-foreground hover:text-foreground transition-colors font-medium"
    >
      {children}
    </a>
  );
}
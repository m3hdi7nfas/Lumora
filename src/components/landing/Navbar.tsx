import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { EditableText } from './EditableText';
import { Logo } from './Logo';

export function Navbar({ isEditingGlobal = false, updateContent }: { isEditingGlobal?: boolean; updateContent?: (path: string, val: any) => void }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2">
          <Logo size="md" />
          <span className="text-xl font-display font-bold">
            <EditableText
              value="Lumora"
              isEditingGlobal={isEditingGlobal}
              onSave={(val) => updateContent?.('siteName', val)}
            />
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <NavLink href="#features">Features</NavLink>
          <NavLink href="#how-it-works">How It Works</NavLink>
          <NavLink href="#about">About</NavLink>
        </div>

        <Link to="/login">
          <Button className="gradient-hero shadow-glow hover:scale-105 transition-transform">
            Log In
          </Button>
        </Link>
      </div>
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
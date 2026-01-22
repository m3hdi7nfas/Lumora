import { Link } from 'react-router-dom';
import { EditableText } from './EditableText';
import { useState } from 'react';
import { ContactDialog } from './ContactDialog';
import { PrivacyDialog } from './PrivacyDialog';
import { TermsDialog } from './TermsDialog';
import { AboutDialog } from './AboutDialog';
import { Logo } from '@/components/ui/Logo';
import { Shield, Heart } from 'lucide-react';

export function Footer({ isEditingGlobal = false, updateContent }: { isEditingGlobal?: boolean; updateContent?: (path: string, val: any) => void }) {
  const [contactOpen, setContactOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  return (
    <footer className="py-12 border-t border-border bg-card">
      <div className="container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-2">
            <Logo size="lg" textSize="lg" />
          </Link>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="w-4 h-4" />
            <span>Lumora is a registered Non-Profit Organization</span>
          </div>

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <button
              onClick={() => setAboutOpen(true)}
              className="hover:text-foreground transition-colors"
            >
              About
            </button>
            <button
              onClick={() => setContactOpen(true)}
              className="hover:text-foreground transition-colors"
            >
              Contact
            </button>
            <button
              onClick={() => setPrivacyOpen(true)}
              className="hover:text-foreground transition-colors"
            >
              Privacy
            </button>
            <button
              onClick={() => setTermsOpen(true)}
              className="hover:text-foreground transition-colors"
            >
              Terms
            </button>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-border/50 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Lumora Education. All rights reserved.</p>
          <p className="mt-1">A 501(c)(3) non-profit organization dedicated to educational excellence.</p>
        </div>
      </div>

      {/* Dialogs */}
      <ContactDialog open={contactOpen} onOpenChange={setContactOpen} />
      <PrivacyDialog open={privacyOpen} onOpenChange={setPrivacyOpen} />
      <TermsDialog open={termsOpen} onOpenChange={setTermsOpen} />
      <AboutDialog open={aboutOpen} onOpenChange={setAboutOpen} />
    </footer>
  );
}
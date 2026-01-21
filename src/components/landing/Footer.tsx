import { Link } from 'react-router-dom';
import { EditableText } from './EditableText';
import { useState } from 'react';
import { ContactDialog } from './ContactDialog';
import { PrivacyDialog } from './PrivacyDialog';
import { TermsDialog } from './TermsDialog';
import { AboutDialog } from './AboutDialog';
import { Logo } from './Logo';
import { Heart } from 'lucide-react';

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
            <Logo size="sm" />
            <span className="font-display font-bold">
              <EditableText
                value="Lumora"
                isEditingGlobal={isEditingGlobal}
                onSave={(val) => updateContent?.('siteName', val)}
              />
            </span>
          </Link>

          <p className="text-muted-foreground text-sm flex items-center gap-1">
            Made with <Heart className="w-4 h-4 text-destructive fill-current" /> for education
          </p>

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
      </div>

      {/* Dialogs */}
      <ContactDialog open={contactOpen} onOpenChange={setContactOpen} />
      <PrivacyDialog open={privacyOpen} onOpenChange={setPrivacyOpen} />
      <TermsDialog open={termsOpen} onOpenChange={setTermsOpen} />
      <AboutDialog open={aboutOpen} onOpenChange={setAboutOpen} />
    </footer>
  );
}
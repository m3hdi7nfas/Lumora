import { Link } from 'react-router-dom';
import { Instagram } from 'lucide-react';
import { EditableText } from './EditableText';
import { useState } from 'react';
import { ContactDialog } from './ContactDialog';
import { PrivacyDialog } from './PrivacyDialog';
import { TermsDialog } from './TermsDialog';
import { AboutDialog } from './AboutDialog';
import { HowItWorksDialog } from './HowItWorksDialog';
import { Logo } from '@/components/ui/Logo';

export function Footer({ isEditingGlobal = false, updateContent }: { isEditingGlobal?: boolean; updateContent?: (path: string, val: any) => void }) {
  const [contactOpen, setContactOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);

  return (
    <footer className="mt-auto py-8 border-t border-border bg-card/95 backdrop-blur-sm relative z-10 w-full">
      <div className="container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left section - Logo */}
          <div className="flex-1 flex justify-start">
            <Link to="/" className="flex items-center gap-2">
              <Logo size="lg" textSize="lg" />
            </Link>
          </div>

          {/* Center section - Absolutely centered */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center gap-2">
            <p className="text-muted-foreground text-sm flex items-center whitespace-nowrap">
              Lumora is a Non-Profit Organization (NPO) • Established in 2024
            </p>

            <div className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm">
              <Instagram className="w-4 h-4" />
              <a
                href="https://instagram.com/lumora.connect"
                target="_blank"
                rel="noopener noreferrer"
              >
                @lumora.connect
              </a>
            </div>
          </div>

          {/* Mobile Center section */}
          <div className="flex lg:hidden flex-col items-center gap-4 py-4">
            <p className="text-muted-foreground text-sm text-center">
              Lumora is a Non-Profit Organization (NPO) • Established in 2024
            </p>
            <div className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm">
              <Instagram className="w-4 h-4" />
              <a href="https://instagram.com/lumora.connect" target="_blank" rel="noopener noreferrer">@lumora.connect</a>
            </div>
          </div>

          {/* Right section - Links */}
          <div className="flex-1 flex justify-end">
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
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
      </div>

      {/* Dialogs */}
      <ContactDialog open={contactOpen} onOpenChange={setContactOpen} />
      <PrivacyDialog open={privacyOpen} onOpenChange={setPrivacyOpen} />
      <TermsDialog open={termsOpen} onOpenChange={setTermsOpen} />
      <AboutDialog open={aboutOpen} onOpenChange={setAboutOpen} />
      <HowItWorksDialog open={howItWorksOpen} onOpenChange={setHowItWorksOpen} />
    </footer>
  );
}
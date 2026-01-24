import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileText, Calendar, User, Shield, Trophy, BookOpen, AlertTriangle, Mail } from 'lucide-react';

interface TermsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TermsDialog({ open, onOpenChange }: TermsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Terms of Service
          </DialogTitle>
          <DialogDescription>
            Last updated: June 1, 2025
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4 text-sm">
          <section>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Introduction
            </h2>
            <p className="text-muted-foreground mb-3">
              Welcome to Lumora ("we", "our", "us"). These Terms of Service ("Terms") govern your access to and use of our educational platform, including any content, functionality, and services offered through our website and applications.
            </p>
            <p className="text-muted-foreground mb-3">
              By accessing or using our platform, you agree to be bound by these Terms. If you do not agree to these Terms, you may not access or use our platform.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              Eligibility
            </h2>
            <p className="text-muted-foreground mb-3">
              Our platform is intended for use by educational institutions, teachers, and students. By using our platform, you represent and warrant that:
            </p>
            <div className="space-y-2 ml-4">
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span className="text-muted-foreground">You are at least 13 years of age or have obtained parental consent.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span className="text-muted-foreground">You are using the platform for educational purposes.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span className="text-muted-foreground">You have the legal capacity to enter into these Terms.</span>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              User Accounts
            </h2>
            <p className="text-muted-foreground mb-3">
              To access certain features of our platform, you may be required to create an account. You agree to:
            </p>
            <div className="space-y-2 ml-4">
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span className="text-muted-foreground">Provide accurate, current, and complete information during registration.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span className="text-muted-foreground">Maintain the security of your account credentials.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span className="text-muted-foreground">Not share your account with others or allow others to use your account.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span className="text-muted-foreground">Notify us immediately of any unauthorized use of your account.</span>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-primary" />
              Platform Usage
            </h2>
            <p className="text-muted-foreground mb-3">
              You agree to use our platform in compliance with all applicable laws and regulations. Prohibited activities include:
            </p>
            <div className="space-y-2 ml-4">
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span className="text-muted-foreground">Using the platform for any illegal or unauthorized purpose.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span className="text-muted-foreground">Violating the intellectual property rights of others.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span className="text-muted-foreground">Posting or transmitting any content that is harmful, offensive, or inappropriate.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span className="text-muted-foreground">Interfering with or disrupting the operation of the platform.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span className="text-muted-foreground">Using automated means to access or scrape the platform.</span>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              Competitions and Challenges
            </h2>
            <p className="text-muted-foreground mb-3">
              Our platform offers educational competitions and challenges. By participating, you agree to:
            </p>
            <div className="space-y-2 ml-4">
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span className="text-muted-foreground">Follow all competition rules and guidelines.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span className="text-muted-foreground">Not engage in cheating or any form of academic dishonesty.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span className="text-muted-foreground">Accept that competition results are final and not subject to appeal.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span className="text-muted-foreground">Allow us to use your participation data for educational and statistical purposes.</span>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-primary" />
              Termination
            </h2>
            <p className="text-muted-foreground mb-3">
              We may terminate or suspend your account and access to our platform immediately, without prior notice or liability, for any reason, including if you breach these Terms.
            </p>
            <p className="text-muted-foreground mb-3">
              Upon termination, your right to use our platform will cease immediately.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              Disclaimer of Warranties
            </h2>
            <p className="text-muted-foreground mb-3">
              Our platform is provided on an "as is" and "as available" basis. We make no representations or warranties of any kind, express or implied, regarding the operation of our platform or the information, content, or materials included on it.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              Limitation of Liability
            </h2>
            <p className="text-muted-foreground mb-3">
              To the fullest extent permitted by applicable law, in no event shall Lumora, its affiliates, or their respective directors, officers, employees, agents, or licensors be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, or other intangible losses.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Changes to Terms
            </h2>
            <p className="text-muted-foreground mb-3">
              We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary" />
              Contact Us
            </h2>
            <p className="text-muted-foreground mb-3">
              If you have any questions about these Terms, please contact us at legal@lumora.com.
            </p>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
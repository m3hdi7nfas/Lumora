import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Shield, FileText, Calendar, Globe, User, Lock, Mail } from 'lucide-react';

interface PrivacyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PrivacyDialog({ open, onOpenChange }: PrivacyDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Privacy Policy
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
              Welcome to Lumora ("we", "our", "us"). We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact us at privacy@lumora.com.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              Information We Collect
            </h2>
            <p className="text-muted-foreground mb-3">
              We collect personal information that you voluntarily provide to us when registering on the platform, expressing an interest in obtaining information about us or our products and services, or otherwise contacting us.
            </p>
            <div className="space-y-2 ml-4">
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span className="text-muted-foreground">Personal Information Provided by You: Name, email address, school affiliation, and other similar information.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span className="text-muted-foreground">Usage Data: Information about how you use our platform, including your activity and interactions.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span className="text-muted-foreground">Device Data: Information about the device you use to access our platform, including IP address, browser type, and operating system.</span>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Lock className="w-4 h-4 text-primary" />
              How We Use Your Information
            </h2>
            <p className="text-muted-foreground mb-3">
              We use personal information collected via our platform for a variety of business purposes described below:
            </p>
            <div className="space-y-2 ml-4">
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span className="text-muted-foreground">To facilitate account creation and authentication.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span className="text-muted-foreground">To provide, operate, and maintain our platform.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span className="text-muted-foreground">To send you technical information, updates, security alerts, and support messages.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span className="text-muted-foreground">To respond to your inquiries and fulfill your requests.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span className="text-muted-foreground">For other business purposes such as data analysis, identifying usage trends, and improving our platform.</span>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" />
              Sharing Your Information
            </h2>
            <p className="text-muted-foreground mb-3">
              We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations.
            </p>
            <div className="space-y-2 ml-4">
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span className="text-muted-foreground">With service providers who help us operate our platform and provide services to you.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span className="text-muted-foreground">With your school or educational institution as part of our educational services.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span className="text-muted-foreground">With law enforcement or other third parties when required by law or to protect our rights.</span>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              Data Retention
            </h2>
            <p className="text-muted-foreground mb-3">
              We will only keep your personal information for as long as it is necessary for the purposes set out in this privacy policy, unless a longer retention period is required or permitted by law.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              Your Privacy Rights
            </h2>
            <p className="text-muted-foreground mb-3">
              Depending on your location, you may have the following rights regarding your personal information:
            </p>
            <div className="space-y-2 ml-4">
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span className="text-muted-foreground">The right to access and obtain a copy of your personal information.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span className="text-muted-foreground">The right to request rectification or erasure of your personal information.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span className="text-muted-foreground">The right to restrict or object to the processing of your personal information.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span className="text-muted-foreground">The right to withdraw consent at any time.</span>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Lock className="w-4 h-4 text-primary" />
              Security
            </h2>
            <p className="text-muted-foreground mb-3">
              We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, please also remember that we cannot guarantee that the internet itself is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Changes to This Policy
            </h2>
            <p className="text-muted-foreground mb-3">
              We may update this privacy policy from time to time. The updated version will be indicated by an updated "Last updated" date and the updated version will be effective as soon as it is accessible.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary" />
              Contact Us
            </h2>
            <p className="text-muted-foreground mb-3">
              If you have questions or comments about this policy, you may email us at privacy@lumora.com or by post to:
            </p>
            <div className="ml-4 text-muted-foreground">
              <p>Lumora Education</p>
              <p>123 Education Street</p>
              <p>Knowledge City, KC 12345</p>
              <p>United States</p>
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
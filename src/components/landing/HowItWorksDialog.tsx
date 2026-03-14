import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Target, Trophy, Swords, Zap, Rocket, Star, Medal } from 'lucide-react';

interface HowItWorksDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HowItWorksDialog({ open, onOpenChange }: HowItWorksDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-display">
            <Zap className="w-6 h-6 text-primary fill-primary" />
            How Lumora Works
          </DialogTitle>
          <DialogDescription className="text-base">
            Your journey from student to academic champion starts here.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8 py-6">
          <div className="grid gap-6">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                <Rocket className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-1">1. Join a Competition</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Browse through active competitions curated for your grade level. Once you join, you'll represent your school and start earning points for yourself and your institution.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center shrink-0 border border-accent/20">
                <Target className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-1">2. Conquer Quizzes</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Enter question sets that range from Easy to Hard. Some allow 3 attempts where your best score counts, while others are high-stakes 1-time attempts. Review slides and resources before starting!
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center shrink-0 border border-gold/20">
                <Medal className="w-6 h-6 text-gold" />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-1">3. Climb the Leaderboard</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Every correct answer boosts your profile score. Watch your school rise in the national rankings and unlock unique achievement badges as you reach major milestones.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-muted/30 border border-border/50">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <Star className="w-4 h-4 text-accent fill-accent" />
              Pro Tips
            </h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Use <strong>Practice Mode</strong> to sharpen your skills before entering official competition sets.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Pay attention to the <strong>Difficulty Badge</strong>; Harder questions offer significantly more points!</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Don't forget to check for <strong>learning slides</strong> within sets — they often contain hints for the upcoming questions.</span>
              </li>
            </ul>
          </div>

          <div className="text-center p-4 bg-primary/5 rounded-xl border border-primary/10">
            <p className="text-sm font-medium text-primary">
              Ready to show what you know? Log in and start your first quiz today!
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

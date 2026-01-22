import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { GraduationCap, Users, Trophy, BookOpen, Target, Award, Swords, Star, Globe, Heart, Shield, Handshake } from 'lucide-react';

interface AboutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AboutDialog({ open, onOpenChange }: AboutDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary" />
            About Lumora
          </DialogTitle>
          <DialogDescription>
            Transforming education through gamified learning experiences
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <section className="text-center">
            <div className="mb-4">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl gradient-hero flex items-center justify-center">
                <GraduationCap className="w-10 h-10 text-primary-foreground" />
              </div>
              <h2 className="text-2xl font-display font-bold">Welcome to Lumora</h2>
              <p className="text-muted-foreground mt-2">
                Where learning meets competition in an engaging, gamified educational platform
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              Our Non-Profit Mission
            </h2>
            <p className="text-muted-foreground mb-3">
              Lumora is a registered 501(c)(3) non-profit organization dedicated to making quality education accessible to all students, regardless of their background or circumstances.
            </p>
            <p className="text-muted-foreground mb-3">
              As a non-profit, we reinvest all proceeds back into improving our platform, creating more educational content, and expanding access to students worldwide.
            </p>
            <p className="text-muted-foreground">
              Our mission is to bridge educational gaps and provide engaging learning experiences that inspire students to reach their full potential.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Star className="w-4 h-4 text-primary" />
              Our Vision
            </h2>
            <p className="text-muted-foreground mb-3">
              We envision a world where every student has access to high-quality, engaging educational experiences that foster a lifelong love of learning.
            </p>
            <div className="space-y-2 ml-4">
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span className="text-muted-foreground">Provide free educational resources to students worldwide</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span className="text-muted-foreground">Create engaging, gamified learning experiences</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span className="text-muted-foreground">Support educators with innovative teaching tools</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span className="text-muted-foreground">Build a global community of learners and educators</span>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-primary" />
              What We Offer
            </h2>
            <p className="text-muted-foreground mb-3">
              Lumora provides a comprehensive platform with features designed to enhance the learning experience:
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
                <div className="flex items-center gap-3 mb-2">
                  <Trophy className="w-5 h-5 text-primary" />
                  <h3 className="font-medium">Competitions</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Participate in exciting academic competitions that challenge your knowledge and skills across various subjects.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-5 h-5 text-primary" />
                  <h3 className="font-medium">School Leaderboards</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Compete with other schools and see how your institution ranks nationally and globally.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
                <div className="flex items-center gap-3 mb-2">
                  <Target className="w-5 h-5 text-primary" />
                  <h3 className="font-medium">Practice Mode</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Sharpen your skills with unlimited practice questions and prepare for competitions.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
                <div className="flex items-center gap-3 mb-2">
                  <Award className="w-5 h-5 text-primary" />
                  <h3 className="font-medium">Badges & Achievements</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Earn badges for milestones and achievements, and showcase your academic accomplishments.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
                <div className="flex items-center gap-3 mb-2">
                  <Swords className="w-5 h-5 text-primary" />
                  <h3 className="font-medium">1v1 Challenges</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Challenge your friends and classmates to head-to-head academic battles.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
                <div className="flex items-center gap-3 mb-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <h3 className="font-medium">Diverse Topics</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Access questions and content spanning multiple subjects, curated by educators.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Handshake className="w-4 h-4 text-primary" />
              Our Non-Profit Values
            </h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full gradient-hero flex items-center justify-center flex-shrink-0">
                  <Heart className="w-4 h-4 text-primary-foreground" />
                </div>
                <div>
                  <h4 className="font-medium">Accessibility</h4>
                  <p className="text-sm text-muted-foreground">
                    We believe quality education should be accessible to all students, regardless of their socioeconomic background.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full gradient-hero flex items-center justify-center flex-shrink-0">
                  <Shield className="w-4 h-4 text-primary-foreground" />
                </div>
                <div>
                  <h4 className="font-medium">Integrity</h4>
                  <p className="text-sm text-muted-foreground">
                    We maintain the highest standards of educational integrity and transparency in all our operations.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full gradient-hero flex items-center justify-center flex-shrink-0">
                  <Globe className="w-4 h-4 text-primary-foreground" />
                </div>
                <div>
                  <h4 className="font-medium">Community</h4>
                  <p className="text-sm text-muted-foreground">
                    We foster a global community of learners, educators, and supporters working together to improve education.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full gradient-hero flex items-center justify-center flex-shrink-0">
                  <Star className="w-4 h-4 text-primary-foreground" />
                </div>
                <div>
                  <h4 className="font-medium">Innovation</h4>
                  <p className="text-sm text-muted-foreground">
                    We continuously innovate to create engaging, effective learning experiences that inspire students.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Our Team
            </h2>
            <p className="text-muted-foreground mb-3">
              Lumora is built by a passionate team of educators, technologists, and designers who are dedicated to transforming education. Our team brings together expertise from various fields to create an innovative learning platform.
            </p>
            <p className="text-muted-foreground">
              We are united by our belief in the power of gamified learning and our commitment to helping students achieve their academic goals.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" />
              Join Our Community
            </h2>
            <p className="text-muted-foreground mb-3">
              Whether you're a student looking to enhance your learning, a teacher seeking innovative teaching tools, or a school aiming to improve academic performance, Lumora has something for you.
            </p>
            <p className="text-muted-foreground">
              Join thousands of students and educators who are already experiencing the benefits of gamified learning with Lumora.
            </p>
          </section>

          <section className="text-center py-4">
            <p className="text-muted-foreground">
              <span className="font-medium">Lumora</span> - Where learning becomes an adventure!
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Lumora Education is a registered 501(c)(3) non-profit organization. All donations are tax-deductible.
            </p>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
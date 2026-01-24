import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { GraduationCap, Users, Trophy, BookOpen, Target, Award, Swords, Star, Globe, Heart } from 'lucide-react';

interface AboutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AboutDialog({ open, onOpenChange }: AboutDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
              <Star className="w-4 h-4 text-primary" />
              Our Mission
            </h2>
            <p className="text-muted-foreground mb-3">
              At Lumora, we believe that education should be engaging, competitive, and fun. Our mission is to revolutionize the way students learn by combining educational content with gamification elements that motivate and inspire.
            </p>
            <p className="text-muted-foreground">
              We aim to create a learning environment where students are excited to participate, teachers can track progress effectively, and schools can foster a culture of academic excellence.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" />
              Our Vision
            </h2>
            <p className="text-muted-foreground mb-3">
              We envision a world where every student is empowered to reach their full potential through personalized, competitive learning experiences. By leveraging technology and gamification, we strive to:
            </p>
            <div className="space-y-2 ml-4">
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span className="text-muted-foreground">Make learning more engaging and enjoyable</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span className="text-muted-foreground">Foster healthy academic competition among students</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span className="text-muted-foreground">Provide teachers with powerful tools to enhance their teaching</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span className="text-muted-foreground">Create a global community of learners and educators</span>
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
              <Heart className="w-4 h-4 text-primary" />
              Our Values
            </h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full gradient-hero flex items-center justify-center flex-shrink-0">
                  <Star className="w-4 h-4 text-primary-foreground" />
                </div>
                <div>
                  <h4 className="font-medium">Excellence</h4>
                  <p className="text-sm text-muted-foreground">We strive for the highest standards in education and technology.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full gradient-hero flex items-center justify-center flex-shrink-0">
                  <Users className="w-4 h-4 text-primary-foreground" />
                </div>
                <div>
                  <h4 className="font-medium">Community</h4>
                  <p className="text-sm text-muted-foreground">We believe in the power of learning communities and collaboration.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full gradient-hero flex items-center justify-center flex-shrink-0">
                  <Trophy className="w-4 h-4 text-primary-foreground" />
                </div>
                <div>
                  <h4 className="font-medium">Innovation</h4>
                  <p className="text-sm text-muted-foreground">We continuously innovate to improve the learning experience.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full gradient-hero flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-4 h-4 text-primary-foreground" />
                </div>
                <div>
                  <h4 className="font-medium">Accessibility</h4>
                  <p className="text-sm text-muted-foreground">We are committed to making quality education accessible to all.</p>
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
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
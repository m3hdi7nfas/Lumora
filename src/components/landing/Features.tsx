import { Trophy, Users, Target, Award, Swords, BookOpen, LucideIcon, Plus, Trash2 } from 'lucide-react';
import { ScrollAnimation } from '@/components/animations/ScrollAnimation';
import { defaultSiteContent, SiteContent } from '@/lib/siteContent';
import { EditableText } from './EditableText';
import { Button } from '@/components/ui/button';

const iconMap: Record<string, LucideIcon> = {
  Trophy,
  Users,
  Target,
  Award,
  Swords,
  BookOpen
};

const styles = [
  { color: 'text-gold', bg: 'bg-gold/10' },
  { color: 'text-accent', bg: 'bg-accent/10' },
  { color: 'text-primary', bg: 'bg-primary/10' },
  { color: 'text-success', bg: 'bg-success/10' },
  { color: 'text-warning', bg: 'bg-warning/10' },
  { color: 'text-secondary-foreground', bg: 'bg-secondary' },
];

interface FeaturesProps {
  content?: SiteContent['features'];
  isEditingGlobal?: boolean;
  updateContent?: (val: any) => void;
}

export function Features({
  content = defaultSiteContent.features,
  isEditingGlobal = false,
  updateContent
}: FeaturesProps) {
  const handleUpdateFeature = (index: number, field: string, value: string) => {
    const newContent = [...content];
    newContent[index] = { ...newContent[index], [field]: value };
    updateContent?.(newContent);
  };

  const handleAddFeature = () => {
    const newContent = [...content, { title: 'New Feature', description: 'Describe your feature here', icon: 'Target' }];
    updateContent?.(newContent);
  };

  const handleDeleteFeature = (index: number) => {
    const newContent = content.filter((_, i) => i !== index);
    updateContent?.(newContent);
  };

  return (
    <section id="features" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/50 to-transparent" />

      <div className="container relative z-10">
        <ScrollAnimation>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Everything You Need to <span className="text-gradient">Succeed</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A complete learning platform designed to make education engaging and competitive.
            </p>
          </div>
        </ScrollAnimation>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {content.map((feature, index) => {
            const Icon = iconMap[feature.icon] || Trophy;
            const style = styles[index % styles.length];

            return (
              <ScrollAnimation key={index} delay={index * 0.1}>
                <div
                  className="p-8 rounded-2xl bg-card border border-border/50 shadow-card hover:shadow-card-hover transition-all hover:-translate-y-1 h-full relative group/card"
                >
                  {isEditingGlobal && (
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute -top-4 -right-4 h-8 w-8 rounded-full opacity-0 group-hover/card:opacity-100 transition-opacity z-20 shadow-lg"
                      onClick={() => handleDeleteFeature(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                  <div className={`inline-flex p-4 rounded-2xl ${style.bg} mb-6`}>
                    <Icon className={`w-8 h-8 ${style.color}`} />
                  </div>
                  <h3 className="text-xl font-display font-bold mb-3">
                    <EditableText
                      value={feature.title}
                      isEditingGlobal={isEditingGlobal}
                      onSave={(val) => handleUpdateFeature(index, 'title', val)}
                    />
                  </h3>
                  <div className="text-muted-foreground">
                    <EditableText
                      value={feature.description}
                      isEditingGlobal={isEditingGlobal}
                      onSave={(val) => handleUpdateFeature(index, 'description', val)}
                      multiline
                      textClassName="text-muted-foreground"
                    />
                  </div>
                </div>
              </ScrollAnimation>
            );
          })}

          {isEditingGlobal && (
            <button
              onClick={handleAddFeature}
              className="p-8 rounded-2xl border-2 border-dashed border-border/50 flex flex-col items-center justify-center gap-4 hover:border-primary/50 hover:bg-primary/5 transition-all group"
            >
              <div className="p-4 rounded-full bg-muted group-hover:bg-primary/10 transition-colors">
                <Plus className="w-8 h-8 text-muted-foreground group-hover:text-primary" />
              </div>
              <p className="font-semibold text-muted-foreground group-hover:text-primary">Add Feature</p>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

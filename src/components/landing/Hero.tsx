import { Button } from '@/components/ui/button';
import { Trophy, Users, Zap, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ScrollAnimation } from '@/components/animations/ScrollAnimation';
import { defaultSiteContent, SiteContent } from '@/lib/siteContent';
import { CountingNumber } from '@/components/animations/CountingNumber';
import { EditableText } from './EditableText';

interface HeroProps {
  content?: SiteContent['hero'];
  isEditingGlobal?: boolean;
  updateContent?: (field: string, value: any) => void;
}

export function Hero({
  content = defaultSiteContent.hero,
  isEditingGlobal = false,
  updateContent
}: HeroProps) {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden pt-20 md:pt-24 pb-20 md:pb-32">
      {/* Background gradient */}
      <div className="absolute inset-0 gradient-hero opacity-10" />

      {/* Floating shapes */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-accent/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />

      <div className="container relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <ScrollAnimation delay={0}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-8">
              <Star className="w-4 h-4 text-accent" />
              <EditableText
                value={content.badge}
                isEditingGlobal={isEditingGlobal}
                onSave={(val) => updateContent?.('badge', val)}
                textClassName="text-sm font-medium text-accent"
              />
            </div>
          </ScrollAnimation>

          {/* Main headline */}
          <ScrollAnimation delay={0.1}>
            <h1 className="text-5xl md:text-7xl font-display font-bold mb-6">
              <EditableText
                value={content.title_prefix}
                isEditingGlobal={isEditingGlobal}
                onSave={(val) => updateContent?.('title_prefix', val)}
              />
              <EditableText
                value={content.title_highlight}
                isEditingGlobal={isEditingGlobal}
                onSave={(val) => updateContent?.('title_highlight', val)}
                textClassName="text-gradient"
              />
            </h1>
          </ScrollAnimation>

          <ScrollAnimation delay={0.2}>
            <div className="mb-10 max-w-2xl mx-auto">
              <EditableText
                value={content.description}
                isEditingGlobal={isEditingGlobal}
                onSave={(val) => updateContent?.('description', val)}
                multiline
                textClassName="text-xl md:text-2xl text-muted-foreground"
              />
            </div>
          </ScrollAnimation>

          {/* CTA Buttons */}
          <ScrollAnimation delay={0.3}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link to="/login">
                <Button size="lg" className="gradient-hero text-lg px-8 py-6 shadow-glow hover:scale-105 transition-transform">
                  <EditableText
                    value={content.cta_primary}
                    isEditingGlobal={isEditingGlobal}
                    onSave={(val) => updateContent?.('cta_primary', val)}
                  />
                  <Zap className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 hover:bg-secondary">
                <EditableText
                  value={content.cta_secondary}
                  isEditingGlobal={isEditingGlobal}
                  onSave={(val) => updateContent?.('cta_secondary', val)}
                />
              </Button>
            </div>
          </ScrollAnimation>

          {/* Stats */}
          <ScrollAnimation delay={0.4}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <StatCard
                icon={Users}
                value={content.stats.students}
                label="Students"
                isEditingGlobal={isEditingGlobal}
                onSave={(val) => updateContent?.('stats.students', val)}
              />
              <StatCard
                icon={Trophy}
                value={content.stats.competitions}
                label="Competitions"
                isEditingGlobal={isEditingGlobal}
                onSave={(val) => updateContent?.('stats.competitions', val)}
              />
              <StatCard
                icon={Star}
                value={content.stats.questions}
                label="Questions"
                isEditingGlobal={isEditingGlobal}
                onSave={(val) => updateContent?.('stats.questions', val)}
              />
              <StatCard
                icon={Zap}
                value={content.stats.answers}
                label="Answers"
                isEditingGlobal={isEditingGlobal}
                onSave={(val) => updateContent?.('stats.answers', val)}
              />
            </div>
          </ScrollAnimation>
        </div>
      </div>
    </section>
  );
}

function StatCard({
  icon: Icon,
  value,
  label,
  isEditingGlobal,
  onSave
}: {
  icon: any;
  value: string;
  label: string;
  isEditingGlobal?: boolean;
  onSave?: (val: string) => void;
}) {
  return (
    <div className="p-6 rounded-2xl glass hover:shadow-card transition-all">
      <Icon className="w-8 h-8 text-accent mx-auto mb-3" />
      <div className="text-3xl font-display font-bold">
        {isEditingGlobal ? (
          <EditableText
            value={value}
            isEditingGlobal={isEditingGlobal}
            onSave={onSave || (() => { })}
          />
        ) : (
          <CountingNumber value={value} />
        )}
      </div>
      <div className="text-muted-foreground">{label}</div>
    </div>
  );
}
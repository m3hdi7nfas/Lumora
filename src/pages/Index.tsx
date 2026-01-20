import { Navbar } from '@/components/landing/Navbar';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { Footer } from '@/components/landing/Footer';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { defaultSiteContent, SiteContent } from '@/lib/siteContent';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { LandingPageEditor } from '@/components/landing/LandingPageEditor';
import { Button } from '@/components/ui/button';
import { Edit, Check } from 'lucide-react';
import { AdBox } from '@/components/ads/AdBox';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const Index = () => {
  const { profile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: content = defaultSiteContent } = useQuery({
    queryKey: ['landing-content'],
    queryFn: async () => {
      // Use localStorage for persistence - no database dependency
      const local = localStorage.getItem('lumora-landing-content');

      if (local) {
        try {
          return JSON.parse(local) as SiteContent;
        } catch (e) {
          console.error('Error parsing local content, using default:', e);
          return defaultSiteContent;
        }
      }

      return defaultSiteContent;
    },
    initialData: () => {
      const local = localStorage.getItem('lumora-landing-content');
      if (local) {
        try {
          return JSON.parse(local);
        } catch (e) {
          return defaultSiteContent;
        }
      }
      return defaultSiteContent;
    },
  });

  const saveContent = useMutation({
    mutationFn: async (newContent: SiteContent) => {
      // Save to localStorage only - no database dependency
      localStorage.setItem('lumora-landing-content', JSON.stringify(newContent));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landing-content'] });
      toast({ title: 'Landing page updated!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error updating content', description: error.message, variant: 'destructive' });
    },
  });

  const updateContent = (path: string, value: any) => {
    // Helper to deeply set value in object
    const setDeep = (obj: any, pathParts: string[], val: any): any => {
      const newObj = { ...obj };
      let current = newObj;
      for (let i = 0; i < pathParts.length - 1; i++) {
        const key = pathParts[i];
        current[key] = { ...current[key] };
        current = current[key];
      }
      current[pathParts[pathParts.length - 1]] = val;
      return newObj;
    };

    const parts = path.split('.');
    const updatedContent = setDeep(content, parts, value);

    // Optimistic update of local state
    queryClient.setQueryData(['landing-content'], updatedContent);

    // Save to localStorage
    saveContent.mutate(updatedContent);
  };

  return (
    <div className="min-h-screen relative">
      <Navbar isEditingGlobal={isEditing} updateContent={updateContent} />
      <Hero
        content={content.hero}
        isEditingGlobal={isEditing}
        updateContent={(field, val) => updateContent(`hero.${field}`, val)}
      />
      <Features
        content={content.features}
        isEditingGlobal={isEditing}
        updateContent={(val) => updateContent('features', val)}
      />
      <Footer isEditingGlobal={isEditing} updateContent={updateContent} />

      {/* Floating Ad Box */}
      <AdBox />

      {/* Moderator Controls - REMOVED */}
      {/* {profile?.role === 'moderator' && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
          <Button
            onClick={() => setIsEditing(!isEditing)}
            className={cn(
              "rounded-full h-14 w-14 shadow-xl transition-all hover:scale-110",
              isEditing ? "bg-success text-success-foreground" : "gradient-hero"
            )}
          >
            {isEditing ? <Check className="w-6 h-6" /> : <Edit className="w-6 h-6" />}
          </Button>
          {isEditing && (
            <p className="bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold shadow-sm border border-border animate-bounce">
              Editing Mode Active
            </p>
          )}
        </div>
      )} */}
    </div>
  );
};

export default Index;
import { Navbar } from '@/components/landing/Navbar';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { Footer } from '@/components/landing/Footer';
import { defaultSiteContent, SiteContent } from '@/lib/siteContent';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { AdBox } from '@/components/ads/AdBox';

const Index = () => {
  const { profile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState<SiteContent>(defaultSiteContent);

  // Load content from local storage
  useEffect(() => {
    const local = localStorage.getItem('lumora-landing-content');
    if (local) {
      try {
        setContent(JSON.parse(local) as SiteContent);
      } catch (e) {
        console.error('Error parsing local content, using default:', e);
      }
    }
  }, []);

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

    // Update state
    setContent(updatedContent);

    // Save to localStorage
    localStorage.setItem('lumora-landing-content', JSON.stringify(updatedContent));
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <Navbar isEditingGlobal={isEditing} updateContent={updateContent} profile={profile} />
      <main className="flex-1">
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
      </main>
      <Footer isEditingGlobal={isEditing} updateContent={updateContent} />

      {/* Floating Ad Boxes on the left, centered below header */}
      <div className="hidden lg:flex fixed left-4 top-[calc(50%+32px)] -translate-y-1/2 z-40 flex-col gap-4">
        <AdBox />
        <AdBox />
      </div>

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
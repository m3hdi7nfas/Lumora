import { Navbar } from '@/components/landing/Navbar';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { Footer } from '@/components/landing/Footer';
import { defaultSiteContent, SiteContent } from '@/lib/siteContent';
import { useAuth } from '@/contexts/AuthContext'; // Make sure this import is correct
import { useState, useEffect } from 'react';
import { AdBox } from '@/components/ads/AdBox';
import ErrorBoundary from '@/components/ErrorBoundary';

const Index = () => {
  const { profile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState<SiteContent>(defaultSiteContent);
  const [error, setError] = useState<string | null>(null);

  // Load content from local storage with error handling
  useEffect(() => {
    try {
      const local = localStorage.getItem('lumora-landing-content');
      if (local) {
        try {
          setContent(JSON.parse(local) as SiteContent);
        } catch (e) {
          console.error('Error parsing local content, using default:', e);
          setError('Failed to load custom content, using defaults');
        }
      }
    } catch (error) {
      console.error('Error accessing local storage:', error);
      setError('Failed to access local storage');
    }
  }, []);

  const updateContent = (path: string, value: any) => {
    try {
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
    } catch (error) {
      console.error('Error updating content:', error);
      setError('Failed to update content');
    }
  };

  // Add error display
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 max-w-md mx-auto p-6">
          <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-lg">
            <h3 className="font-medium mb-2">Content Error</h3>
            <p className="text-sm">{error}</p>
          </div>
          <Button
            onClick={() => {
              setError(null);
              setContent(defaultSiteContent);
            }}
            className="gradient-hero"
          >
            Reset to Defaults
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
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
      </div>
    </ErrorBoundary>
  );
};

export default Index;
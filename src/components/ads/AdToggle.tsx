import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export function AdToggle() {
  const [showAds, setShowAds] = useState(true);
  const { toast } = useToast();
  const { profile } = useAuth();

  // Load initial ad setting from localStorage
  useEffect(() => {
    const savedShowAds = localStorage.getItem('showAds');
    if (savedShowAds !== null) {
      setShowAds(savedShowAds === 'true');
    }
  }, []);

  const handleToggle = async (checked: boolean) => {
    try {
      setShowAds(checked);
      // Save to localStorage
      localStorage.setItem('showAds', checked.toString());

      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('adsSettingChanged', {
        detail: { showAds: checked }
      }));

      toast({
        title: 'Ad visibility updated',
        description: `Ads are now ${checked ? 'visible' : 'hidden'} for users`
      });
    } catch (error) {
      toast({
        title: 'Error updating ad settings',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  // Only show this component for admins
  if (profile?.role !== 'admin') {
    return null;
  }

  return (
    <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-card">
      <div className="flex items-center gap-3">
        <Label htmlFor="ad-toggle" className="text-sm font-medium">
          Show Ads to Users
        </Label>
      </div>
      <Switch
        id="ad-toggle"
        checked={showAds}
        onCheckedChange={handleToggle}
      />
    </div>
  );
}
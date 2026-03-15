import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useSystemSettings } from '@/contexts/SystemSettingsContext';

export function AdToggle() {
  const { settings, updateSetting } = useSystemSettings();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { profile } = useAuth();

  const handleToggle = async (checked: boolean) => {
    setLoading(true);
    try {
      await updateSetting('show_ads', checked);
      toast({
        title: 'Ad visibility updated',
        description: `Ads are now ${checked ? 'visible' : 'hidden'} for all users`
      });
    } catch (error: any) {
      toast({
        title: 'Error updating ad settings',
        description: error.message || 'Check if you have database permissions (RLS)',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
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
          Show Ads to Everyone
        </Label>
      </div>
      <Switch
        id="ad-toggle"
        checked={settings.show_ads}
        onCheckedChange={handleToggle}
        disabled={loading}
      />
    </div>
  );
}
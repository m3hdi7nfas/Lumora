import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export function AdToggle() {
  const [showAds, setShowAds] = useState(true);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { profile } = useAuth();

  // Load initial ad setting from Supabase
  useEffect(() => {
    fetchAdSetting();

    // Listen for realtime updates
    const channel = supabase
      .channel('system_settings_changes')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'system_settings',
        filter: "key=eq.show_ads"
      }, (payload) => {
        setShowAds(payload.new.value === true || payload.new.value === 'true');
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchAdSetting = async () => {
    const { data, error } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'show_ads')
      .single();
    
    if (!error && data) {
      setShowAds(data.value === true || data.value === 'true');
    }
  };

  const handleToggle = async (checked: boolean) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('system_settings')
        .update({ 
          value: checked,
          updated_at: new Date().toISOString(),
          updated_by: profile?.id
        })
        .eq('key', 'show_ads');

      if (error) throw error;

      setShowAds(checked);
      toast({
        title: 'Ad visibility updated',
        description: `Ads are now ${checked ? 'visible' : 'hidden'} for all users`
      });
    } catch (error) {
      toast({
        title: 'Error updating ad settings',
        description: error.message,
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
        checked={showAds}
        onCheckedChange={handleToggle}
        disabled={loading}
      />
    </div>
  );
}
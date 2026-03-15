import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

interface SystemSettings {
  show_ads: boolean;
}

interface SystemSettingsContextType {
  settings: SystemSettings;
  updateSetting: (key: keyof SystemSettings, value: any) => Promise<void>;
  loading: boolean;
}

const SystemSettingsContext = createContext<SystemSettingsContextType | undefined>(undefined);

export function SystemSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SystemSettings>({
    show_ads: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();

    // Listen for realtime updates to system_settings
    const channel = supabase
      .channel('system_settings_global')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'system_settings'
      }, (payload) => {
        const newData = payload.new as any;
        if (newData && newData.key === 'show_ads') {
          setSettings(prev => ({
            ...prev,
            show_ads: newData.value === true || newData.value === 'true' || String(newData.value).toLowerCase() === 'true'
          }));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('key, value');
      
      if (!error && data) {
        const newSettings = { ...settings };
        data.forEach(item => {
          if (item.key === 'show_ads') {
            newSettings.show_ads = item.value === true || item.value === 'true' || String(item.value).toLowerCase() === 'true';
          }
        });
        setSettings(newSettings);
      }
    } catch (e) {
      console.error('Error fetching system settings:', e);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: keyof SystemSettings, value: any) => {
    // Optimistic Update
    const previousSettings = { ...settings };
    setSettings(prev => ({ ...prev, [key]: value }));

    try {
      const { error } = await supabase
        .from('system_settings')
        .upsert({ 
          key,
          value,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error(`Error updating setting ${key}:`, error);
      // Rollback on error
      setSettings(previousSettings);
      throw error;
    }
  };

  return (
    <SystemSettingsContext.Provider value={{ settings, updateSetting, loading }}>
      {children}
    </SystemSettingsContext.Provider>
  );
}

export function useSystemSettings() {
  const context = useContext(SystemSettingsContext);
  if (context === undefined) {
    throw new Error('useSystemSettings must be used within a SystemSettingsProvider');
  }
  return context;
}

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function AdBox() {
    const [showAds, setShowAds] = useState(false);

    useEffect(() => {
        // Load initial ad setting from Supabase
        fetchAdSetting();

        // Listen for realtime updates
        const channel = supabase
            .channel('ad_settings_listener')
            .on('postgres_changes', { 
                event: '*', 
                schema: 'public', 
                table: 'system_settings',
                filter: "key=eq.show_ads"
            }, (payload) => {
                const val = (payload.new as any)?.value;
                setShowAds(val === true || val === 'true' || String(val).toLowerCase() === 'true');
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchAdSetting = async () => {
        try {
            const { data, error } = await supabase
                .from('system_settings')
                .select('value')
                .eq('key', 'show_ads')
                .maybeSingle();
            
            if (!error && data) {
                const val = data.value;
                setShowAds(val === true || val === 'true' || String(val).toLowerCase() === 'true');
            } else if (!error && !data) {
                // If empty, keep ads hidden by default until configured
                setShowAds(false);
            }
        } catch (e) {
            console.error('Error fetching ad setting in AdBox:', e);
        }
    };

    if (!showAds) {
        return null;
    }

    return (
        <div className="relative w-48 bg-card border border-border/50 rounded-2xl shadow-card-hover p-4">
            {/* Ad Content Placeholder */}
            <div className="space-y-3">
                <div className="text-xs font-semibold text-muted-foreground text-center">
                    Advertisement
                </div>

                {/* Google AdMob Placeholder */}
                <div className="aspect-square bg-muted/30 rounded-lg flex items-center justify-center border border-dashed border-border">
                    <div className="text-center p-4">
                        <p className="text-xs text-muted-foreground">
                            Ad Space
                        </p>
                        <p className="text-[10px] text-muted-foreground/60 mt-1">
                            Google AdMob
                        </p>
                    </div>
                </div>

                <p className="text-[10px] text-center text-muted-foreground/80">
                    Support our platform
                </p>
            </div>
        </div>
    );
}
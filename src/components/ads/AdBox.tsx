import { useState, useEffect } from 'react';
import { Logo } from '@/components/ui/Logo';

export function AdBox() {
    const [showAds, setShowAds] = useState(true);

    useEffect(() => {
        // Load initial ad setting from localStorage
        const savedShowAds = localStorage.getItem('showAds');
        if (savedShowAds !== null) {
            setShowAds(savedShowAds === 'true');
        }

        // Listen for ads setting changes
        const handleAdsSettingChange = (event: CustomEvent) => {
            setShowAds(event.detail.showAds);
        };

        window.addEventListener('adsSettingChanged', handleAdsSettingChange as EventListener);

        return () => {
            window.removeEventListener('adsSettingChanged', handleAdsSettingChange as EventListener);
        };
    }, []);

    if (!showAds) {
        return null;
    }

    return (
        <div className="hidden lg:block fixed left-4 top-1/2 -translate-y-1/2 z-40">
            <div className="relative w-48 bg-card border border-border/50 rounded-2xl shadow-card-hover p-4">
                {/* Ad Content Placeholder */}
                <div className="space-y-3">
                    <div className="text-xs font-semibold text-muted-foreground text-center">
                        Advertisement
                    </div>

                    {/* Google AdMob Placeholder */}
                    <div className="aspect-square bg-muted/30 rounded-lg flex items-center justify-center border border-dashed border-border">
                        <div className="text-center p-4">
                            <Logo size="sm" textSize="sm" />
                            <p className="text-xs text-muted-foreground mt-2">
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
        </div>
    );
}
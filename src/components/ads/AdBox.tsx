export function AdBox() {
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
        </div>
    );
}

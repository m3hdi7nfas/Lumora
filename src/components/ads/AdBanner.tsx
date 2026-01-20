import { useState, useRef, useEffect } from 'react';
import { GripVertical } from 'lucide-react';

export function AdBanner() {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const bannerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging || !bannerRef.current) return;

            const deltaX = e.clientX - dragStart.x;
            const deltaY = e.clientY - dragStart.y;

            const newX = position.x + deltaX;
            const newY = position.y + deltaY;

            // Get banner current screen position
            const rect = bannerRef.current.getBoundingClientRect();

            let finalX = newX;
            let finalY = newY;

            // Constrain X
            if (rect.left + deltaX < 0) {
                finalX = position.x - rect.left;
            } else if (rect.right + deltaX > window.innerWidth) {
                finalX = position.x + (window.innerWidth - rect.right);
            }

            // Constrain Y
            if (rect.top + deltaY < 0) {
                finalY = position.y - rect.top;
            } else if (rect.bottom + deltaY > window.innerHeight) {
                finalY = position.y + (window.innerHeight - rect.bottom);
            }

            setPosition({ x: finalX, y: finalY });
            setDragStart({ x: e.clientX, y: e.clientY });
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (!isDragging || !bannerRef.current) return;

            const touch = e.touches[0];
            const deltaX = touch.clientX - dragStart.x;
            const deltaY = touch.clientY - dragStart.y;

            const newX = position.x + deltaX;
            const newY = position.y + deltaY;

            // Get banner current screen position
            const rect = bannerRef.current.getBoundingClientRect();

            let finalX = newX;
            let finalY = newY;

            // Constrain X
            if (rect.left + deltaX < 0) {
                finalX = position.x - rect.left;
            } else if (rect.right + deltaX > window.innerWidth) {
                finalX = position.x + (window.innerWidth - rect.right);
            }

            // Constrain Y
            if (rect.top + deltaY < 0) {
                finalY = position.y - rect.top;
            } else if (rect.bottom + deltaY > window.innerHeight) {
                finalY = position.y + (window.innerHeight - rect.bottom);
            }

            setPosition({ x: finalX, y: finalY });
            setDragStart({ x: touch.clientX, y: touch.clientY });
        };

        const handleTouchEnd = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.addEventListener('touchmove', handleTouchMove);
            document.addEventListener('touchend', handleTouchEnd);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleTouchEnd);
        };
    }, [isDragging, dragStart, position]);

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX, y: e.clientY });
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        setIsDragging(true);
        const touch = e.touches[0];
        setDragStart({ x: touch.clientX, y: touch.clientY });
    };

    return (
        <div
            ref={bannerRef}
            className="fixed bottom-4 right-4 z-[100]"
            style={{
                transform: `translate(${position.x}px, ${position.y}px)`,
                cursor: isDragging ? 'grabbing' : 'default',
                touchAction: 'none'
            }}
        >
            <div className="w-64 bg-card border border-border/50 rounded-2xl shadow-card-hover overflow-hidden">
                {/* Draggable Handle */}
                <div
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleTouchStart}
                    className="bg-muted/50 border-b border-border/30 px-4 py-2 cursor-grab active:cursor-grabbing flex items-center justify-center gap-2 hover:bg-muted/70 transition-colors"
                >
                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">Drag to move</span>
                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                </div>

                {/* Ad Content */}
                <div className="p-4">
                    <div className="space-y-3">
                        <div className="text-xs font-semibold text-muted-foreground text-center">
                            Advertisement
                        </div>

                        {/* Google AdMob Placeholder with Publisher ID */}
                        <div className="aspect-video bg-muted/30 rounded-lg flex items-center justify-center border border-dashed border-border">
                            <div className="text-center p-4">
                                <p className="text-xs text-muted-foreground">
                                    Ad Space
                                </p>
                                <p className="text-[10px] text-muted-foreground/60 mt-1">
                                    Google AdMob - Publisher ID: 1494612613065040
                                </p>
                            </div>
                        </div>

                        <p className="text-[10px] text-center text-muted-foreground/80">
                            Support our platform
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
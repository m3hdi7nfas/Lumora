import { useState, useEffect, useRef } from 'react';
import { Pencil, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface EditableTextProps {
    value: string;
    onSave: (newValue: string) => void;
    isEditingGlobal: boolean;
    multiline?: boolean;
    className?: string;
    textClassName?: string;
}

export function EditableText({
    value,
    onSave,
    isEditingGlobal,
    multiline = false,
    className,
    textClassName,
}: EditableTextProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [tempValue, setTempValue] = useState(value);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setTempValue(value);
    }, [value]);

    const handleSave = () => {
        onSave(tempValue);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setTempValue(value);
        setIsEditing(false);
    };

    if (!isEditingGlobal) {
        return <span className={textClassName}>{value}</span>;
    }

    if (isEditing) {
        return (
            <div className={cn("relative z-50 group inline-block w-full", className)} ref={containerRef}>
                {multiline ? (
                    <Textarea
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        className="w-full min-h-[100px] mb-2"
                        autoFocus
                    />
                ) : (
                    <Input
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        className="w-full mb-2"
                        autoFocus
                    />
                )}
                <div className="flex gap-2 justify-end">
                    <Button size="sm" variant="outline" onClick={handleCancel} className="h-8 w-8 p-0">
                        <X className="w-4 h-4" />
                    </Button>
                    <Button size="sm" className="h-8 w-8 p-0 gradient-hero" onClick={handleSave}>
                        <Check className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div
            className={cn("relative group inline-block cursor-pointer hover:outline hover:outline-2 hover:outline-primary/50 hover:outline-dashed rounded px-1 -mx-1 transition-all", className)}
            onClick={() => setIsEditing(true)}
        >
            <span className={textClassName}>{value}</span>
            <div className="absolute -top-3 -right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-primary-foreground rounded-full p-1 shadow-lg">
                <Pencil className="w-3 h-3" />
            </div>
        </div>
    );
}

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useTheme } from 'next-themes';
import { Moon, Sun, Monitor, Shield, User, GraduationCap, Users } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface SettingsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
    const { theme, setTheme } = useTheme();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Settings</DialogTitle>
                    <DialogDescription>
                        Customize your interface and experience.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Appearance Section */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium flex items-center gap-2">
                            <Sun className="w-4 h-4" /> Appearance
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                variant={theme === 'light' ? 'default' : 'outline'}
                                className="flex flex-col gap-2 h-20"
                                onClick={() => setTheme('light')}
                            >
                                <Sun className="w-5 h-5" />
                                <span className="text-xs">Light</span>
                            </Button>
                            <Button
                                variant={theme === 'dark' ? 'default' : 'outline'}
                                className="flex flex-col gap-2 h-20"
                                onClick={() => setTheme('dark')}
                            >
                                <Moon className="w-5 h-5" />
                                <span className="text-xs">Dark</span>
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                    <Button onClick={() => onOpenChange(false)}>Close</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Mail } from 'lucide-react';

interface MessageDetailDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    messageId: string | null;
}

export function MessageDetailDialog({ open, onOpenChange, messageId }: MessageDetailDialogProps) {
    const [message, setMessage] = useState<any | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchMessage = async () => {
            if (!messageId || !open) return;
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('messages')
                    .select('*')
                    .eq('id', messageId)
                    .single();
                if (data) {
                    setMessage(data);
                    if (!data.is_read) {
                        await supabase.from('messages').update({ is_read: true }).eq('id', messageId);
                    }
                }
            } catch (e) {
                console.error(e);
            }
            setLoading(false);
        };

        fetchMessage();
    }, [messageId, open]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <Mail className="w-5 h-5" />
                        </div>
                        <DialogTitle className="text-xl font-display font-bold">Message Details</DialogTitle>
                    </div>
                    <DialogDescription>
                        Direct message from Lumora
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="py-12 flex justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : message ? (
                    <div className="space-y-6 py-4">
                        <div className="space-y-1">
                            <h3 className="text-lg font-semibold">{message.subject}</h3>
                            <p className="text-sm text-muted-foreground">
                                From: <span className="text-foreground font-medium">{message.sender_name}</span> • {new Date(message.created_at).toLocaleString()}
                            </p>
                        </div>
                        
                        <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
                            <ScrollArea className="max-h-[300px]">
                                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                                    {message.body}
                                </p>
                            </ScrollArea>
                        </div>
                    </div>
                ) : (
                    <div className="py-8 text-center text-muted-foreground">
                        Message not found.
                    </div>
                )}

                <DialogFooter>
                    <Button onClick={() => onOpenChange(false)} className="gradient-hero w-full sm:w-auto">
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

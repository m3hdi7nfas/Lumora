import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Search, MessageSquare, Trash2, Loader2, Clock, Mail, MailOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { supabase } from '@/lib/supabase';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MessagesDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialMessageId?: string | null;
}

export function MessagesDialog({ open, onOpenChange, initialMessageId }: MessagesDialogProps) {
    const { profile } = useAuth();
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState<any | null>(null);
    const [replyContent, setReplyContent] = useState('');
    const [sendingReply, setSendingReply] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const [isComposeMode, setIsComposeMode] = useState(false);
    const [recipientEmail, setRecipientEmail] = useState('');
    const [subject, setSubject] = useState('');
    const [composeContent, setComposeContent] = useState('');
    const [sendingMessage, setSendingMessage] = useState(false);

    const { toast } = useToast();

    const isAdminOrMod = profile?.role === 'admin' || profile?.role === 'moderator';

    const filteredMessages = (messages || []).filter(message =>
        (message?.subject || "").toLowerCase().includes((searchTerm || "").toLowerCase()) ||
        (message?.sender_name || "").toLowerCase().includes((searchTerm || "").toLowerCase()) ||
        (message?.body || "").toLowerCase().includes((searchTerm || "").toLowerCase())
    );

    const fetchMessages = async () => {
        if (!profile?.id) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .or(`recipient_id.eq.${profile.id},recipient_role.eq.${profile.role},recipient_role.eq.all`)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setMessages(data || []);

            // Handle initial message selection
            if (initialMessageId) {
                const found = (data || []).find((m: any) => m.id === initialMessageId);
                if (found) {
                    setSelectedMessage(found);
                    if (!found.is_read) {
                        handleMarkRead(found.id);
                    }
                }
            } else if (!selectedMessage && data && data.length > 0) {
                // Optionally select first message
            }
        } catch (e: any) {
            console.error('Error fetching messages:', e);
        }
        setLoading(false);
    };

    const handleMarkRead = async (id: string) => {
        try {
            const { error } = await supabase.from('messages').update({ is_read: true }).eq('id', id);
            if (error) throw error;
            setMessages(prev => prev.map(m => m.id === id ? { ...m, is_read: true } : m));
            if (selectedMessage?.id === id) {
                setSelectedMessage((prev: any) => prev ? { ...prev, is_read: true } : null);
            }
        } catch (e) {
            console.error('Error marking as read:', e);
        }
    };

    const handleSendMessage = async () => {
        if (!recipientEmail || !subject || !composeContent) {
            toast({ title: 'Please fill all fields', variant: 'destructive' });
            return;
        }

        setSendingMessage(true);
        try {
            const { data: recipientUser, error: userError } = await supabase
                .from('profiles')
                .select('id, role')
                .eq('email', recipientEmail.trim().toLowerCase())
                .single();

            if (userError || !recipientUser) {
                toast({ title: 'Recipient not found', description: 'No user with that email exists.', variant: 'destructive' });
                setSendingMessage(false);
                return;
            }

            const newMessage = {
                sender_id: profile?.id,
                sender_name: profile?.display_name || profile?.email || 'User',
                sender_role: profile?.role,
                recipient_id: recipientUser.id,
                recipient_role: 'specific',
                subject: subject,
                body: composeContent,
                is_read: false,
                status: 'approved' // Direct messages are usually approved
            };

            const { error } = await supabase.from('messages').insert(newMessage);
            if (error) throw error;

            toast({ title: 'Message sent successfully!' });
            setIsComposeMode(false);
            setRecipientEmail('');
            setSubject('');
            setComposeContent('');
            fetchMessages();
        } catch (error: any) {
            toast({ title: 'Error sending message', description: error.message, variant: 'destructive' });
        }
        setSendingMessage(false);
    };

    const handleSendReply = async () => {
        if (!replyContent || !selectedMessage) return;

        setSendingReply(true);
        try {
            const newMessage = {
                sender_id: profile?.id,
                sender_name: profile?.display_name || profile?.email || 'User',
                sender_role: profile?.role,
                recipient_id: selectedMessage.sender_id,
                recipient_role: 'specific',
                subject: `Re: ${selectedMessage.subject}`,
                body: replyContent,
                is_read: false,
                status: 'approved'
            };

            const { error } = await supabase.from('messages').insert(newMessage);
            if (error) throw error;

            toast({ title: 'Reply sent successfully!' });
            setReplyContent('');
            fetchMessages();
        } catch (error: any) {
            toast({ title: 'Error sending reply', description: error.message, variant: 'destructive' });
        }
        setSendingReply(false);
    };

    const handleDeleteMessage = async (messageId: string) => {
        try {
            const { error } = await supabase.from('messages').delete().eq('id', messageId);
            if (error) throw error;
            setMessages(messages.filter(msg => msg.id !== messageId));
            if (selectedMessage?.id === messageId) setSelectedMessage(null);
            toast({ title: 'Message deleted' });
        } catch (error: any) {
            toast({ title: 'Error deleting message', description: error.message, variant: 'destructive' });
        }
    };

    useEffect(() => {
        if (open) {
            fetchMessages();
        }
    }, [open, initialMessageId]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-0 shrink-0">
                    <div className="flex justify-between items-start">
                        <div>
                            <DialogTitle className="text-2xl font-display font-bold">Messages</DialogTitle>
                            <DialogDescription>Your inbox and notifications</DialogDescription>
                        </div>
                        {isAdminOrMod && (
                            <Button onClick={() => setIsComposeMode(!isComposeMode)} variant={isComposeMode ? "outline" : "default"} className={!isComposeMode ? "gradient-hero" : ""}>
                                {isComposeMode ? "View Inbox" : "Compose Message"}
                            </Button>
                        )}
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-hidden grid md:grid-cols-3 p-6 gap-6 min-h-0">
                    <div className="md:col-span-1 flex flex-col gap-4 overflow-hidden h-full">
                        <div className="relative shrink-0">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search messages..."
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <ScrollArea className="flex-1 pr-4">
                            <div className="space-y-2">
                                {loading ? (
                                    <div className="text-center py-8"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></div>
                                ) : filteredMessages.length === 0 ? (
                                    <p className="text-center text-muted-foreground py-8 text-sm">No messages</p>
                                ) : (
                                    filteredMessages.map((msg) => (
                                        <button
                                            key={msg.id}
                                            onClick={() => {
                                                setSelectedMessage(msg);
                                                if (!msg.is_read) handleMarkRead(msg.id);
                                            }}
                                            className={`w-full text-left p-3 rounded-xl transition-all border ${selectedMessage?.id === msg.id ? 'bg-primary/10 border-primary' : 'hover:bg-muted border-transparent'} ${!msg.is_read ? 'font-semibold' : ''}`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${!msg.is_read ? 'bg-primary' : 'bg-transparent'}`} />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-1">
                                                        <p className="text-xs font-medium truncate">{msg.sender_name}</p>
                                                        <p className="text-[10px] text-muted-foreground whitespace-nowrap">
                                                            {new Date(msg.created_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <p className="text-sm truncate">{msg.subject}</p>
                                                    <p className="text-xs text-muted-foreground truncate opacity-70">{msg.body}</p>
                                                </div>
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        </ScrollArea>
                    </div>

                    <div className="md:col-span-2 overflow-hidden flex flex-col border rounded-xl bg-muted/30 p-6 min-h-0">
                        {isComposeMode ? (
                            <div className="space-y-4">
                                <h2 className="text-xl font-bold">New Message</h2>
                                <div className="space-y-3">
                                    <div className="space-y-1">
                                        <Label>Recipient Email</Label>
                                        <Input value={recipientEmail} onChange={e => setRecipientEmail(e.target.value)} placeholder="user@example.com" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label>Subject</Label>
                                        <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Message subject" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label>Body</Label>
                                        <Textarea value={composeContent} onChange={e => setComposeContent(e.target.value)} placeholder="Type your message here..." className="min-h-[250px] resize-none" />
                                    </div>
                                    <div className="flex justify-end">
                                        <Button onClick={handleSendMessage} disabled={sendingMessage || !recipientEmail || !subject || !composeContent} className="gradient-hero">
                                            {sendingMessage && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                            Send Message
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ) : selectedMessage ? (
                            <div className="flex flex-col h-full overflow-hidden">
                                <div className="shrink-0 mb-4 flex justify-between items-start">
                                    <div>
                                        <h2 className="text-xl font-bold">{selectedMessage.subject}</h2>
                                        <p className="text-sm text-muted-foreground">
                                            From: <span className="font-semibold text-foreground">{selectedMessage.sender_name}</span> • {new Date(selectedMessage.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                    {profile?.role === 'admin' && (
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="hover:text-destructive shrink-0">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Delete Message</AlertDialogTitle>
                                                    <AlertDialogDescription>Delete this message permanently? This cannot be undone.</AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => handleDeleteMessage(selectedMessage.id)}>Delete</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    )}
                                </div>

                                <ScrollArea className="flex-1 bg-card rounded-lg border p-4 mb-4">
                                    <p className="text-sm whitespace-pre-wrap">{selectedMessage.body}</p>
                                </ScrollArea>

                                <div className="shrink-0 space-y-3">
                                    {isAdminOrMod ? (
                                        <>
                                            <Textarea
                                                value={replyContent}
                                                onChange={(e) => setReplyContent(e.target.value)}
                                                placeholder="Type your reply..."
                                                className="min-h-[100px] resize-none"
                                            />
                                            <div className="flex justify-end">
                                                <Button onClick={handleSendReply} disabled={sendingReply || !replyContent} className="gradient-hero">
                                                    {sendingReply && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                                    Send Reply
                                                </Button>
                                            </div>
                                        </>
                                    ) : (
                                        <p className="text-xs text-center text-muted-foreground italic">Reply restricted to Admins/Moderators.</p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center space-y-2">
                                <MessageSquare className="w-12 h-12 text-muted-foreground opacity-20" />
                                <p className="text-muted-foreground">Select a message to read it.</p>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

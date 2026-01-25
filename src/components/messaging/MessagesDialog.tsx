import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Search, MessageSquare, Trash2, Loader2, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface MessagesDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function MessagesDialog({ open, onOpenChange }: MessagesDialogProps) {
    const [messages, setMessages] = useState<any[]>([]);
    const [selectedMessage, setSelectedMessage] = useState<any>(null);
    const [replyContent, setReplyContent] = useState('');
    const [sendingReply, setSendingReply] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);

    const [isComposeMode, setIsComposeMode] = useState(false);
    const [recipient, setRecipient] = useState('');
    const [subject, setSubject] = useState('');
    const [composeContent, setComposeContent] = useState('');
    const [sendingMessage, setSendingMessage] = useState(false);

    const { toast } = useToast();
    const { profile } = useAuth();

    const isAdminOrMod = profile?.role === 'admin' || profile?.role === 'moderator';

    const filteredMessages = (messages || []).filter(message =>
        (message?.subject || "").toLowerCase().includes((searchTerm || "").toLowerCase()) ||
        (message?.sender || "").toLowerCase().includes((searchTerm || "").toLowerCase()) ||
        (message?.content || "").toLowerCase().includes((searchTerm || "").toLowerCase())
    );

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const storedMessages = JSON.parse(localStorage.getItem('lumora_messages') || '[]');

            // Filter logic:
            // 1. Admins see everything.
            // 2. Others see messages sent to them (if approved or from Admin).
            // 3. Sender sees their own messages regardless of status.

            const filtered = storedMessages.filter((m: any) => {
                const isAdmin = profile?.role === 'admin';
                const isModerator = profile?.role === 'moderator';
                const isSender = m.senderId === profile?.id;
                const isRecipient = m.recipient === profile?.email || m.recipient === profile?.role;

                if (isAdmin) return true;
                if (isSender) return true;
                if (isRecipient) {
                    // Only show approved messages or messages from Admin
                    return m.status === 'approved' || m.senderRole === 'admin';
                }
                return false;
            });

            setMessages(filtered.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        } catch (error: any) {
            toast({ title: 'Error fetching messages', description: error.message, variant: 'destructive' });
        }
        setLoading(false);
    };

    const handleSendMessage = async () => {
        if (!recipient || !subject || !composeContent) {
            toast({ title: 'Please fill all fields', variant: 'destructive' });
            return;
        }

        setSendingMessage(true);
        try {
            const newMessage = {
                id: `msg-${Date.now()}`,
                sender: profile?.display_name || profile?.email || 'User',
                senderEmail: profile?.email,
                senderId: profile?.id,
                senderRole: profile?.role,
                recipient, // Email or role
                subject,
                content: composeContent,
                date: new Date().toISOString(),
                read: false,
                status: profile?.role === 'moderator' ? 'pending_approval' : 'approved'
            };

            // Save to localStorage
            const allMessages = JSON.parse(localStorage.getItem('lumora_messages') || '[]');
            allMessages.push(newMessage);
            localStorage.setItem('lumora_messages', JSON.stringify(allMessages));

            toast({
                title: profile?.role === 'moderator' ? 'Message submitted for approval!' : 'Message sent successfully!',
                description: profile?.role === 'moderator' ? 'An Admin will review your message shortly.' : undefined
            });
            setIsComposeMode(false);
            setRecipient('');
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
            // Mock send reply
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast({ title: 'Reply sent successfully!' });
            setReplyContent('');
        } catch (error: any) {
            toast({ title: 'Error sending reply', description: error.message, variant: 'destructive' });
        }
        setSendingReply(false);
    };

    const handleUpdateStatus = (messageId: string, newStatus: string) => {
        try {
            const allMessages = JSON.parse(localStorage.getItem('lumora_messages') || '[]');
            const updated = allMessages.map((m: any) =>
                m.id === messageId ? { ...m, status: newStatus } : m
            );
            localStorage.setItem('lumora_messages', JSON.stringify(updated));
            toast({ title: `Message ${newStatus}!` });
            fetchMessages();
            if (selectedMessage?.id === messageId) {
                setSelectedMessage({ ...selectedMessage, status: newStatus });
            }
        } catch (e) { toast({ title: 'Error updating status' }); }
    };

    const handleDeleteMessage = async (messageId: string) => {
        setLoading(true);
        try {
            const allMessages = JSON.parse(localStorage.getItem('lumora_messages') || '[]');
            const updated = allMessages.filter((msg: any) => msg.id !== messageId);
            localStorage.setItem('lumora_messages', JSON.stringify(updated));
            setMessages(messages.filter(msg => msg.id !== messageId));
            if (selectedMessage?.id === messageId) {
                setSelectedMessage(null);
            }
            toast({ title: 'Message deleted successfully!' });
        } catch (error: any) {
            toast({ title: 'Error deleting message', description: error.message, variant: 'destructive' });
        }
        setLoading(false);
    };

    useEffect(() => {
        if (open) {
            fetchMessages();
        }
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-0 shrink-0">
                    <div className="flex justify-between items-start">
                        <div>
                            <DialogTitle className="text-2xl font-display font-bold">Inbox</DialogTitle>
                            <DialogDescription>Your communications and notifications</DialogDescription>
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

                        <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                            {loading ? (
                                <div className="text-center py-4">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                                </div>
                            ) : filteredMessages.length === 0 ? (
                                <p className="text-center text-muted-foreground py-4 text-sm">No messages found</p>
                            ) : (
                                filteredMessages.map((message) => (
                                    <button
                                        key={message.id}
                                        onClick={() => setSelectedMessage(message)}
                                        className={`w-full text-left p-3 rounded-xl transition-all border ${selectedMessage?.id === message.id ? 'bg-primary/10 border-primary shadow-sm' : 'hover:bg-muted border-transparent'} ${!message.read && 'font-semibold'}`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold flex-shrink-0 text-primary">
                                                {message.sender.split(' ').map((n: string) => n[0]).join('')}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className="text-sm truncate">{message.sender}</p>
                                                    <p className="text-[10px] text-muted-foreground whitespace-nowrap">{message.date}</p>
                                                </div>
                                                <p className="text-xs text-muted-foreground truncate">{message.subject}</p>
                                                <div className="flex gap-2 mt-1">
                                                    {!message.read && (
                                                        <span className="w-2 h-2 bg-primary rounded-full" />
                                                    )}
                                                    {message.status === 'pending_approval' && (
                                                        <span className="text-[10px] px-1 bg-warning/20 text-warning rounded-sm">PENDING</span>
                                                    )}
                                                </div>
                                            </div>
                                            {profile?.role !== 'student' && profile?.role !== 'teacher' && (
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Delete Message</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Are you sure you want to delete this message? This action cannot be undone.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                className="bg-destructive hover:bg-destructive/90"
                                                                onClick={() => handleDeleteMessage(message.id)}
                                                            >
                                                                Delete
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            )}
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="md:col-span-2 overflow-y-auto h-full border rounded-xl bg-muted/30 p-6">
                        {isComposeMode ? (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold">New Message</h2>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Recipient (Email)</Label>
                                        <Input value={recipient} onChange={e => setRecipient(e.target.value)} placeholder="student@example.com" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Subject</Label>
                                        <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Message subject" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Message Content</Label>
                                        <Textarea value={composeContent} onChange={e => setComposeContent(e.target.value)} placeholder="Type your message here..." className="min-h-[200px] resize-none bg-card" />
                                    </div>
                                    <div className="flex justify-end">
                                        <Button onClick={handleSendMessage} disabled={sendingMessage || !recipient || !subject || !composeContent} className="gradient-hero">
                                            {sendingMessage && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                            Send Message
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ) : selectedMessage ? (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-xl font-bold">{selectedMessage.subject}</h2>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        From: <span className="font-semibold text-foreground">{selectedMessage.sender}</span> &lt;{selectedMessage.senderEmail}&gt; • {selectedMessage.date}
                                    </p>
                                </div>

                                <div className="p-6 bg-card rounded-xl border shadow-sm space-y-3">
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{selectedMessage.content}</p>

                                    {selectedMessage.status === 'pending_approval' && (
                                        <div className="mt-2 px-3 py-1 rounded-full bg-warning/20 text-warning text-[10px] font-bold uppercase w-fit inline-flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> Pending Approval
                                        </div>
                                    )}
                                </div>


                                {profile?.role === 'admin' && selectedMessage.status === 'pending_approval' && (
                                    <div className="flex gap-3 pt-4 justify-end border-t border-dashed">
                                        <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => handleUpdateStatus(selectedMessage.id, 'rejected')}>Reject</Button>
                                        <Button size="sm" className="bg-success hover:bg-success/90 text-success-foreground" onClick={() => handleUpdateStatus(selectedMessage.id, 'approved')}>Approve Message</Button>
                                    </div>
                                )}

                                <div className="space-y-6 pt-4 border-t">
                                    {isAdminOrMod ? (
                                        <>
                                            <Label className="text-sm font-semibold">Your Reply</Label>
                                            <Textarea
                                                value={replyContent}
                                                onChange={(e) => setReplyContent(e.target.value)}
                                                placeholder="Type your reply here..."
                                                className="min-h-[150px] resize-none bg-card"
                                            />
                                            <div className="flex justify-end">
                                                <Button
                                                    onClick={handleSendReply}
                                                    disabled={sendingReply || !replyContent}
                                                    className="gradient-hero"
                                                >
                                                    {sendingReply && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                                    Send Reply
                                                </Button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="p-4 bg-muted/50 rounded-lg text-center">
                                            <p className="text-sm text-muted-foreground italic">Reply functionality is limited to Administrators and Moderators.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                                <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center">
                                    <MessageSquare className="w-8 h-8 text-muted-foreground" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">No message selected</h3>
                                    <p className="text-sm text-muted-foreground max-w-[250px] mx-auto">Select a message from the list to view its details and reply.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog >
    );
}

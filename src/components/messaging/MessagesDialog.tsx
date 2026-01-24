import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Search, MessageSquare, Trash2, Loader2 } from 'lucide-react';
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
    const { toast } = useToast();
    const { profile } = useAuth();

    const filteredMessages = messages.filter(message =>
        message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const fetchMessages = async () => {
        setLoading(true);
        try {
            // Mock data for messages
            const mockMessages = [
                {
                    id: '1',
                    sender: 'John Doe',
                    senderEmail: 'john@example.com',
                    subject: 'Question about competition',
                    content: 'Hello, I have a question about the upcoming math competition...',
                    date: '2025-06-01',
                    read: false
                },
                {
                    id: '2',
                    sender: 'Jane Smith',
                    senderEmail: 'jane@example.com',
                    subject: 'Technical issue',
                    content: 'I am having trouble accessing the practice questions...',
                    date: '2025-05-30',
                    read: true
                }
            ];
            setMessages(mockMessages);
        } catch (error: any) {
            toast({ title: 'Error fetching messages', description: error.message, variant: 'destructive' });
        }
        setLoading(false);
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

    const handleDeleteMessage = async (messageId: string) => {
        setLoading(true);
        try {
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
                    <DialogTitle className="text-2xl font-display font-bold">Inbox</DialogTitle>
                    <DialogDescription>Your communications and notifications</DialogDescription>
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
                                                {!message.read && (
                                                    <span className="inline-block mt-1 w-2 h-2 bg-primary rounded-full" />
                                                )}
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
                        {selectedMessage ? (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-xl font-bold">{selectedMessage.subject}</h2>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        From: <span className="font-semibold text-foreground">{selectedMessage.sender}</span> &lt;{selectedMessage.senderEmail}&gt; • {selectedMessage.date}
                                    </p>
                                </div>

                                <div className="p-6 bg-card rounded-xl border shadow-sm">
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{selectedMessage.content}</p>
                                </div>

                                <div className="space-y-6 pt-4 border-t">
                                    {profile?.role !== 'student' && profile?.role !== 'teacher' ? (
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
        </Dialog>
    );
}

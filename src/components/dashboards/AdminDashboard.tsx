// Messages Tab Component
function MessagesTab() {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState({
    subject: '',
    content: '',
    receiver_email: '',
    receiver_role: 'all'
  });
  const { toast } = useToast();
  const { profile } = useAuth();

  // Load messages from local storage
  useEffect(() => {
    const storedMessages = localStorageCRUD.get(LOCAL_STORAGE_KEYS.MESSAGES);
    // Sort messages by date (newest first)
    const sortedMessages = storedMessages.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    setMessages(sortedMessages);
  }, []);

  const filteredMessages = messages.filter(message =>
    message.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.sender?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendReply = async () => {
    if (!replyContent || !selectedMessage) return;

    setSendingReply(true);

    try {
      const replyMessage = {
        id: `msg-${Date.now()}`,
        subject: `Re: ${selectedMessage.subject}`,
        content: replyContent,
        sender: profile?.display_name || profile?.email,
        senderEmail: profile?.email,
        receiver_id: selectedMessage.senderEmail,
        receiverEmail: selectedMessage.senderEmail,
        date: new Date().toISOString(),
        read: false,
        created_at: new Date().toISOString()
      };

      // Add to local storage
      localStorageCRUD.add(LOCAL_STORAGE_KEYS.MESSAGES, replyMessage);

      // Update local state
      const updatedMessages = [replyMessage, ...messages];
      setMessages(updatedMessages);

      toast({ title: 'Reply sent successfully!' });
      setReplyContent('');
    } catch (error) {
      console.error('Error sending reply:', error);
      toast({ title: 'Error sending reply', description: error.message, variant: 'destructive' });
    }

    setSendingReply(false);
  };

  const handleSendNewMessage = async () => {
    if (!newMessage.subject || !newMessage.content) {
      toast({ title: 'Please fill subject and content', variant: 'destructive' });
      return;
    }

    setLoading(true);

    try {
      let receiverIds = [];

      if (newMessage.receiver_role === 'all') {
        const users = localStorageCRUD.get(LOCAL_STORAGE_KEYS.USERS);
        receiverIds = users.map(user => user.email);
      } else if (newMessage.receiver_role === 'specific' && newMessage.receiver_email) {
        receiverIds = [newMessage.receiver_email];
      } else {
        const users = localStorageCRUD.get(LOCAL_STORAGE_KEYS.USERS);
        receiverIds = users
          .filter(user => user.role === newMessage.receiver_role)
          .map(user => user.email);
      }

      if (receiverIds.length === 0) {
        toast({ title: 'No recipients found', variant: 'destructive' });
        return;
      }

      const messageData = receiverIds.map(receiverId => ({
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        subject: newMessage.subject,
        content: newMessage.content,
        sender: profile?.display_name || profile?.email,
        senderEmail: profile?.email,
        receiver_id: receiverId,
        receiverEmail: receiverId,
        date: new Date().toISOString(),
        read: false,
        created_at: new Date().toISOString()
      }));

      // Add all messages to local storage
      messageData.forEach(message => {
        localStorageCRUD.add(LOCAL_STORAGE_KEYS.MESSAGES, message);
      });

      // Update local state
      const updatedMessages = [...messageData, ...messages];
      setMessages(updatedMessages);

      toast({ title: `Message sent to ${receiverIds.length} recipient(s)!` });
      setNewMessage({
        subject: '',
        content: '',
        receiver_email: '',
        receiver_role: 'all'
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({ title: 'Error sending message', description: error.message, variant: 'destructive' });
    }

    setLoading(false);
  };

  const handleDeleteMessage = async (messageId: string) => {
    setLoading(true);
    try {
      localStorageCRUD.remove(LOCAL_STORAGE_KEYS.MESSAGES, messageId);

      // Update local state
      const updatedMessages = messages.filter(msg => msg.id !== messageId);
      setMessages(updatedMessages);

      toast({ title: 'Message deleted successfully!' });
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(null);
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({ title: 'Error deleting message', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Messages</h1>
        <p className="text-muted-foreground">Your communications</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Send New Message</CardTitle>
          <CardDescription>Send messages to users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input
                value={newMessage.subject}
                onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
                placeholder="Enter message subject"
              />
            </div>

            <div className="space-y-2">
              <Label>Message Content</Label>
              <Textarea
                value={newMessage.content}
                onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
                placeholder="Enter your message"
                rows={6}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Send To</Label>
                <Select
                  value={newMessage.receiver_role}
                  onValueChange={(value) => setNewMessage({ ...newMessage, receiver_role: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select recipient" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="student">All Students</SelectItem>
                    <SelectItem value="teacher">All Teachers</SelectItem>
                    <SelectItem value="moderator">All Moderators</SelectItem>
                    <SelectItem value="specific">Specific Email</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newMessage.receiver_role === 'specific' && (
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input
                    type="email"
                    value={newMessage.receiver_email}
                    onChange={(e) => setNewMessage({ ...newMessage, receiver_email: e.target.value })}
                    placeholder="user@school.com"
                  />
                </div>
              )}
            </div>

            <Button
              onClick={handleSendNewMessage}
              disabled={loading}
              className="gradient-hero"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Message'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Inbox</CardTitle>
              <CardDescription>Your messages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search messages..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {loading ? (
                    <div className="text-center py-4">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                    </div>
                  ) : filteredMessages.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">No messages found</p>
                  ) : (
                    filteredMessages.map((message) => (
                      <button
                        key={message.id}
                        onClick={() => setSelectedMessage(message)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${selectedMessage?.id === message.id ? 'bg-primary/10 border border-primary' : 'hover:bg-muted/50'} ${!message.read && 'border-l-2 border-primary'}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {message.sender?.split(' ').map(n => n[0]).join('') || message.senderEmail?.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-medium truncate">{message.sender || 'Unknown'}</p>
                              <p className="text-xs text-muted-foreground whitespace-nowrap">{message.date}</p>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{message.subject}</p>
                            <p className="text-xs text-muted-foreground/60 truncate mt-1">{message.content}</p>
                            {!message.read && (
                              <span className="inline-block mt-1 w-2 h-2 bg-primary rounded-full" />
                            )}
                          </div>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm" className="h-6 w-6 p-0">
                                <Trash2 className="w-3 h-3" />
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
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          {selectedMessage ? (
            <Card>
              <CardHeader>
                <CardTitle>{selectedMessage.subject}</CardTitle>
                <CardDescription>
                  From: {selectedMessage.sender || 'Unknown'} &lt;{selectedMessage.senderEmail}&gt; • {selectedMessage.date}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm">{selectedMessage.content}</p>
                  </div>

                  <div className="space-y-4">
                    <Label>Your Reply</Label>
                    <Textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Type your reply here..."
                      rows={8}
                    />
                    <Button
                      onClick={handleSendReply}
                      disabled={sendingReply || !replyContent}
                      className="gradient-hero"
                    >
                      {sendingReply && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Send Reply
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4" />
                  <p>Select a message to view details</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
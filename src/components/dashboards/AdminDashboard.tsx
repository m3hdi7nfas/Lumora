// ... (keep existing imports and code until QuestionSetsTab)

function QuestionSetsTab() {
  const [questionSets, setQuestionSets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingSet, setEditingSet] = useState(null);
  const { toast } = useToast();

  const filteredQuestionSets = questionSets.filter(set =>
    set.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    set.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchQuestionSets = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('question_sets').select('*');
      if (error) throw error;
      setQuestionSets(data || []);
    } catch (error) {
      toast({ title: 'Error fetching question sets', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleAddOrUpdateSet = async (setData) => {
    setLoading(true);
    try {
      if (setData.id) {
        // Update existing set
        const { error } = await supabase.from('question_sets').update(setData).eq('id', setData.id);
        if (error) throw error;
        toast({ title: 'Question set updated successfully!' });
      } else {
        // Add new set
        const newSet = {
          ...setData,
          id: `set-${Date.now()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        const { error } = await supabase.from('question_sets').insert(newSet);
        if (error) throw error;
        toast({ title: 'Question set added successfully!' });
      }

      fetchQuestionSets();
      setIsAddDialogOpen(false);
      setEditingSet(null);
    } catch (error) {
      toast({ title: 'Error saving question set', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleDeleteSet = async (setId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('question_sets').delete().eq('id', setId);
      if (error) throw error;

      toast({ title: 'Question set deleted successfully!' });
      fetchQuestionSets();
    } catch (error) {
      toast({ title: 'Error deleting question set', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const getTimerInfo = (set) => {
    if (!set.is_timed) return 'No time limit';
    return `${set.time_limit_minutes} min${set.auto_submit ? ' (auto-submit)' : ''}`;
  };

  useEffect(() => {
    fetchQuestionSets();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Question Sets</h1>
          <p className="text-muted-foreground">Manage question collections</p>
        </div>
        <Button onClick={() => {
          setEditingSet(null);
          setIsAddDialogOpen(true);
        }} className="gradient-hero">
          <Plus className="w-4 h-4 mr-2" />
          Add Question Set
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Question Sets List</CardTitle>
          <CardDescription>All question sets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search question sets..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {loading ? (
              <div className="text-center py-4">
                <Loader2 className="w-6 h-6 animate-spin mx-auto" />
              </div>
            ) : filteredQuestionSets.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No question sets found</p>
            ) : (
              <div className="space-y-4">
                {filteredQuestionSets.map((set) => (
                  <div key={set.id} className="p-4 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium">{set.name}</h3>
                        <p className="text-xs text-muted-foreground">{set.description}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
                            {set.questions_count || 0} questions
                          </span>
                          <span className="px-2 py-1 rounded-full text-xs bg-success/10 text-success">
                            {set.category}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs ${set.is_timed ? 'bg-warning/10 text-warning' : 'bg-muted text-muted-foreground'}`}>
                            {set.is_timed ? (
                              <>
                                <Clock className="w-3 h-3 inline mr-1" />
                                {getTimerInfo(set)}
                              </>
                            ) : (
                              'No timer'
                            )}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            setEditingSet(set);
                            setIsAddDialogOpen(true);
                          }}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" className="h-8 w-8 p-0">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Question Set</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this question set? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive hover:bg-destructive/90"
                                onClick={() => handleDeleteSet(set.id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Question Set Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsAddDialogOpen(false);
          setEditingSet(null);
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingSet ? 'Edit' : 'Add'} Question Set</DialogTitle>
            <DialogDescription>
              {editingSet ? 'Update' : 'Create a new'} question set with optional timer settings
            </DialogDescription>
          </DialogHeader>
          <QuestionSetForm
            initialData={editingSet}
            onSubmit={handleAddOrUpdateSet}
            onCancel={() => {
              setIsAddDialogOpen(false);
              setEditingSet(null);
            }}
            isLoading={loading}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ... (keep the rest of the existing code)
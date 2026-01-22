// ... (previous imports remain the same)

function CompetitionsTab() {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newCompetition, setNewCompetition] = useState({
    id: '',
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    is_active: true,
    max_participants: 100,
    current_participants: 0,
    category: '',
    difficulty: 'medium',
    created_at: '',
    updated_at: '',
    participating_schools: []
  });
  const [schools, setSchools] = useState([]);
  const [selectAllSchools, setSelectAllSchools] = useState(false);
  const { toast } = useToast();

  const fetchCompetitions = async () => {
    setLoading(true);
    try {
      // Fetch competitions from local storage
      const competitionsData = localStorageCRUD.get(LOCAL_STORAGE_KEYS.COMPETITIONS);
      setCompetitions(competitionsData);
    } catch (error) {
      toast({ title: 'Error fetching competitions', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const fetchSchools = async () => {
    try {
      const schoolsData = localStorageCRUD.get(LOCAL_STORAGE_KEYS.SCHOOLS);
      setSchools(schoolsData);
    } catch (error) {
      console.error('Error fetching schools:', error);
    }
  };

  const filteredCompetitions = competitions.filter(competition =>
    competition.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    competition.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchCompetitions();
    fetchSchools();
  }, []);

  const handleAddCompetition = async () => {
    // Validate required fields
    if (!newCompetition.name) {
      toast({ title: 'Competition name is required', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      // Generate ID
      const newId = `comp-${Date.now()}`;
      const competitionToAdd = {
        ...newCompetition,
        id: newId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Add to local storage
      localStorageCRUD.add(LOCAL_STORAGE_KEYS.COMPETITIONS, competitionToAdd);
      setCompetitions(localStorageCRUD.get(LOCAL_STORAGE_KEYS.COMPETITIONS));

      toast({ title: 'Competition added successfully!' });

      setIsAddDialogOpen(false);
      setNewCompetition({
        id: '',
        name: '',
        description: '',
        start_date: '',
        end_date: '',
        is_active: true,
        max_participants: 100,
        current_participants: 0,
        category: '',
        difficulty: 'medium',
        created_at: '',
        updated_at: '',
        participating_schools: []
      });
      setSelectAllSchools(false);
    } catch (error) {
      toast({ title: 'Error adding competition', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleDeleteCompetition = async (id: string) => {
    setLoading(true);
    try {
      localStorageCRUD.remove(LOCAL_STORAGE_KEYS.COMPETITIONS, id);
      setCompetitions(localStorageCRUD.get(LOCAL_STORAGE_KEYS.COMPETITIONS));

      toast({ title: 'Competition deleted successfully!' });
    } catch (error) {
      toast({ title: 'Error deleting competition', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleSchoolSelection = (schoolId: string) => {
    setNewCompetition(prev => {
      const newSchools = prev.participating_schools.includes(schoolId)
        ? prev.participating_schools.filter(id => id !== schoolId)
        : [...prev.participating_schools, schoolId];
      return { ...prev, participating_schools: newSchools };
    });
  };

  const handleSelectAllSchools = () => {
    if (selectAllSchools) {
      setNewCompetition(prev => ({ ...prev, participating_schools: [] }));
    } else {
      setNewCompetition(prev => ({ ...prev, participating_schools: schools.map(school => school.id) }));
    }
    setSelectAllSchools(!selectAllSchools);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Competitions</h1>
          <p className="text-muted-foreground">Manage learning competitions</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gradient-hero">
          <Plus className="w-4 h-4 mr-2" />
          Add Competition
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Competitions List</CardTitle>
          <CardDescription>All available competitions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search competitions..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {loading ? (
              <div className="text-center py-4">
                <Loader2 className="w-6 h-6 animate-spin mx-auto" />
              </div>
            ) : filteredCompetitions.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No competitions found</p>
            ) : (
              <div className="space-y-4">
                {filteredCompetitions.map((competition) => (
                  <div key={competition.id} className="p-4 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium">{competition.name}</h3>
                        <p className="text-xs text-muted-foreground">{competition.description}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${competition.is_active ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                            {competition.is_active ? 'Active' : 'Inactive'}
                          </span>
                          <span className="text-xs text-muted-foreground">Participants: {competition.current_participants || 0}/{competition.max_participants}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0">
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
                              <AlertDialogTitle>Delete Competition</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this competition? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive hover:bg-destructive/90"
                                onClick={() => handleDeleteCompetition(competition.id)}
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

      {/* Add Competition Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Competition</DialogTitle>
            <DialogDescription>Create a new learning competition</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Competition Name *</Label>
              <Input
                value={newCompetition.name}
                onChange={(e) => setNewCompetition({ ...newCompetition, name: e.target.value })}
                placeholder="e.g., Math Olympiad 2025"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={newCompetition.description}
                onChange={(e) => setNewCompetition({ ...newCompetition, description: e.target.value })}
                placeholder="Describe the competition..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={newCompetition.start_date}
                  onChange={(e) => setNewCompetition({ ...newCompetition, start_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={newCompetition.end_date}
                  onChange={(e) => setNewCompetition({ ...newCompetition, end_date: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Input
                  value={newCompetition.category}
                  onChange={(e) => setNewCompetition({ ...newCompetition, category: e.target.value })}
                  placeholder="e.g., Math, Science, etc."
                />
              </div>
              <div className="space-y-2">
                <Label>Difficulty</Label>
                <Select
                  value={newCompetition.difficulty}
                  onValueChange={(value) => setNewCompetition({ ...newCompetition, difficulty: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Participating Schools</Label>
              <div className="flex items-center gap-2 mb-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAllSchools}
                  className="h-8"
                >
                  {selectAllSchools ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border rounded-md">
                {schools.map((school) => (
                  <div key={school.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`school-${school.id}`}
                      checked={newCompetition.participating_schools.includes(school.id)}
                      onCheckedChange={() => handleSchoolSelection(school.id)}
                    />
                    <Label htmlFor={`school-${school.id}`} className="text-sm truncate">
                      {school.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Checkbox
                id="is-active"
                checked={newCompetition.is_active}
                onCheckedChange={(checked) => setNewCompetition({ ...newCompetition, is_active: checked })}
              />
              <Label htmlFor="is-active">Active Competition</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddCompetition} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Competition'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ... (rest of the file remains the same)
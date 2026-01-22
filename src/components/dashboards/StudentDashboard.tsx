function StudentCompetitionsTab() {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('available'); // 'available' or 'joined'
  const { toast } = useToast();
  const { profile } = useAuth();

  const fetchCompetitions = async () => {
    setLoading(true);
    try {
      // Fetch competitions from local storage
      const storedCompetitions = localStorage.getItem('lumora_competitions');
      if (storedCompetitions) {
        setCompetitions(JSON.parse(storedCompetitions));
      }
    } catch (error) {
      toast({ title: 'Error fetching competitions', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleJoinCompetition = async (competitionId) => {
    try {
      // Update competition in local storage
      const updatedCompetitions = competitions.map(comp => {
        if (comp.id === competitionId) {
          return {
            ...comp,
            current_participants: (comp.current_participants || 0) + 1,
            participants: [...(comp.participants || []), profile?.id]
          };
        }
        return comp;
      });

      localStorage.setItem('lumora_competitions', JSON.stringify(updatedCompetitions));
      setCompetitions(updatedCompetitions);

      toast({ title: 'Competition joined successfully!', description: 'You can now participate in this competition.' });
    } catch (error) {
      toast({ title: 'Error joining competition', description: error.message, variant: 'destructive' });
    }
  };

  const handleLeaveCompetition = async (competitionId) => {
    try {
      // Update competition in local storage
      const updatedCompetitions = competitions.map(comp => {
        if (comp.id === competitionId) {
          return {
            ...comp,
            current_participants: Math.max((comp.current_participants || 0) - 1, 0),
            participants: (comp.participants || []).filter(id => id !== profile?.id)
          };
        }
        return comp;
      });

      localStorage.setItem('lumora_competitions', JSON.stringify(updatedCompetitions));
      setCompetitions(updatedCompetitions);

      toast({ title: 'Left competition successfully!' });
    } catch (error) {
      toast({ title: 'Error leaving competition', description: error.message, variant: 'destructive' });
    }
  };

  useEffect(() => {
    fetchCompetitions();
  }, []);

  // Filter competitions
  const availableCompetitions = competitions.filter(comp =>
    comp.is_active &&
    !comp.participants?.includes(profile?.id) &&
    (comp.current_participants || 0) < (comp.max_participants || Infinity)
  );

  const joinedCompetitions = competitions.filter(comp =>
    comp.participants?.includes(profile?.id)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Competitions</h1>
        <p className="text-muted-foreground">Participate in learning challenges</p>
      </div>

      {/* Filter Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 max-w-[400px]">
          <TabsTrigger value="available">Find Competitions</TabsTrigger>
          <TabsTrigger value="joined">My Competitions</TabsTrigger>
        </TabsList>

        <TabsContent value="available">
          <Card>
            <CardHeader>
              <CardTitle>Available Competitions</CardTitle>
              <CardDescription>Competitions you can join</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                </div>
              ) : availableCompetitions.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No available competitions</p>
              ) : (
                <div className="space-y-4">
                  {availableCompetitions.map(comp => (
                    <div key={comp.id} className="p-4 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex-1">
                          <h3 className="font-medium">{comp.name}</h3>
                          <p className="text-sm text-muted-foreground">{comp.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs">
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {comp.current_participants || 0}/{comp.max_participants || '∞'} participants
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(comp.start_date).toLocaleDateString()} - {new Date(comp.end_date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className="gradient-hero"
                          onClick={() => handleJoinCompetition(comp.id)}
                        >
                          Join Competition
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="joined">
          <Card>
            <CardHeader>
              <CardTitle>My Competitions</CardTitle>
              <CardDescription>Competitions you've joined</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                </div>
              ) : joinedCompetitions.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">You haven't joined any competitions yet</p>
              ) : (
                <div className="space-y-4">
                  {joinedCompetitions.map(comp => (
                    <div key={comp.id} className="p-4 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex-1">
                          <h3 className="font-medium">{comp.name}</h3>
                          <p className="text-sm text-muted-foreground">{comp.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs">
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {comp.current_participants || 0}/{comp.max_participants || '∞'} participants
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(comp.start_date).toLocaleDateString()} - {new Date(comp.end_date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleLeaveCompetition(comp.id)}
                          >
                            Leave
                          </Button>
                          <Button
                            size="sm"
                            className="gradient-hero"
                            onClick={() => toast({ title: 'Participating in competition', description: 'You are now actively participating!' })}
                          >
                            Participate
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
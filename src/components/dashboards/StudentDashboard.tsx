// ... (keep existing imports)

function ChallengesTab() {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchChallenges = async () => {
    setLoading(true);
    try {
      // Fetch challenges from database - now empty by default
      const { data, error } = await supabase.from('challenges').select('*');
      if (error) throw error;
      setChallenges(data || []);
    } catch (error) {
      toast({ title: 'Error fetching challenges', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Challenges</h1>
          <p className="text-muted-foreground">Complete challenges to earn extra points</p>
        </div>
        <Button className="gradient-hero">
          <Users className="w-4 h-4 mr-2" />
          1v1 Friend
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Challenges</CardTitle>
          <CardDescription>Complete these to earn points and badges</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-4">
                <Loader2 className="w-6 h-6 animate-spin mx-auto" />
              </div>
            ) : challenges.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No challenges available</p>
            ) : (
              challenges.map((challenge) => (
                <div key={challenge.id} className="p-4 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium">{challenge.name}</h3>
                      <p className="text-xs text-muted-foreground">{challenge.description}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">{challenge.category}</span>
                        <span className="px-2 py-1 rounded-full text-xs bg-success/10 text-success">{challenge.points} pts</span>
                      </div>
                    </div>
                    <Button size="sm" className="gradient-hero">
                      Start
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
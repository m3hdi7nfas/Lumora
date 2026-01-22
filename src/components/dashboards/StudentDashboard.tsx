function StudentOverviewTab({ setActiveTab, loading }: { setActiveTab: (tab: string) => void, loading: boolean }) {
  const { toast } = useToast();
  const { profile } = useAuth();

  // Get stats from local storage
  const competitions = localStorage.getItem('lumora_competitions') ? JSON.parse(localStorage.getItem('lumora_competitions')) : [];
  const questions = localStorage.getItem('lumora_questions') ? JSON.parse(localStorage.getItem('lumora_questions')) : [];

  const stats = {
    totalCompetitions: competitions.length,
    totalQuestions: questions.length,
    score: profile?.score || 0,
    progress: profile?.progress || 0
  };

  const quickActions = [
    { id: 'competitions', icon: Trophy, title: 'Join Competitions', description: 'Participate in learning challenges' },
    { id: 'challenges', icon: FileQuestion, title: 'Complete Challenges', description: 'Earn extra points and badges' },
    { id: 'leaderboard', icon: CheckSquare, title: 'View Leaderboard', description: 'See how you rank against others' },
    { id: 'messages', icon: MessageSquare, title: 'Check Messages', description: 'Read your communications' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Student Dashboard</h1>
          <p className="text-muted-foreground">Track your learning progress and achievements</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Competitions"
          value={stats.totalCompetitions.toString()}
          icon={Trophy}
          className="bg-primary/10 border-primary/20"
        />
        <StatCard
          title="Total Questions"
          value={stats.totalQuestions.toLocaleString()}
          icon={FileQuestion}
          className="bg-accent/10 border-accent/20"
        />
        <StatCard
          title="Your Score"
          value={stats.score.toLocaleString()}
          icon={Star}
          className="bg-success/10 border-success/20"
        />
        <StatCard
          title="Progress"
          value={`${stats.progress}%`}
          icon={TrendingUp}
          className="bg-warning/10 border-warning/20"
        />
      </div>

      {/* Quick Actions and Recent Activity in 2 columns */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common student tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action, index) => (
                <button
                  key={action.id}
                  onClick={() => setActiveTab(action.id)}
                  className={`p-4 rounded-xl border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all text-left ${index === quickActions.length - 1 && quickActions.length % 2 === 1 ? 'md:col-span-2' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-muted">
                      <action.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{action.title}</h3>
                      <p className="text-xs text-muted-foreground">{action.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest learning events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-center text-muted-foreground py-4">No recent activity</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
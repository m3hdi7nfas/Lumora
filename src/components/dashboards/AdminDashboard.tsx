// Update the AdminOverviewTab component to include pending approvals in stats

function AdminOverviewTab({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  // ... existing code ...

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      try {
        const { data: users, error: usersError } = await supabase.from('profiles').select('*');
        if (usersError) throw usersError;

        const { data: competitions, error: compError } = await supabase.from('competitions').select('*');
        if (compError) throw compError;

        const { data: questions, error: questionsError } = await supabase.from('questions').select('*');
        if (questionsError) throw questionsError;

        const { data: pending, error: pendingError } = await supabase.from('pending_approvals').select('*');
        if (pendingError) throw pendingError;

        return {
          totalUsers: users.length,
          activeCompetitions: competitions.length,
          totalQuestions: questions.length,
          pendingReviews: pending.length
        };
      } catch (error) {
        console.error('Error fetching stats:', error);
        return {
          totalUsers: 0,
          activeCompetitions: 0,
          totalQuestions: 0,
          pendingReviews: 0
        };
      }
    }
  });

  const quickActions = [
    { id: 'competitions', icon: Trophy, title: 'Manage Competitions', description: 'Create and edit competitions' },
    { id: 'questions', icon: FileQuestion, title: 'Review Questions', description: 'Approve pending questions' },
    { id: 'users', icon: Users, label: 'User Management', description: 'Manage user accounts' },
    { id: 'schools', icon: School, title: 'School Settings', description: 'Configure school access' },
    { id: 'approvals', icon: CheckSquare, title: 'Pending Approvals', description: 'Review moderator actions' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Full control over platform activity and settings</p>
        </div>
      </div>

      {/* Settings Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Ads Toggle */}
        <Card>
          <CardHeader>
            <CardTitle>Advertisement Settings</CardTitle>
            <CardDescription>Control whether ads are displayed to users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <LayoutTemplate className="w-5 h-5 text-primary" />
                <span>Show Advertisements</span>
              </div>
              <Switch
                checked={showAds}
                onCheckedChange={handleAdsToggle}
                id="ads-toggle"
                disabled={loading}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers?.toLocaleString() || '0'}
          icon={Users}
          className="bg-primary/10 border-primary/20"
          loading={statsLoading}
        />
        <StatCard
          title="Active Competitions"
          value={stats?.activeCompetitions?.toString() || '0'}
          icon={Trophy}
          className="bg-accent/10 border-accent/20"
          loading={statsLoading}
        />
        <StatCard
          title="Total Questions"
          value={stats?.totalQuestions?.toLocaleString() || '0'}
          icon={FileQuestion}
          className="bg-success/10 border-success/20"
          loading={statsLoading}
        />
        <StatCard
          title="Pending Approvals"
          value={stats?.pendingReviews?.toString() || '0'}
          icon={Clock}
          className="bg-warning/10 border-warning/20"
          loading={statsLoading}
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common admin tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={() => setActiveTab(action.id)}
                className="p-4 rounded-xl border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all text-left"
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
          <CardDescription>Latest platform events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-center text-muted-foreground py-4">No recent activity</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
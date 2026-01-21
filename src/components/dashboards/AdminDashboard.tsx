// ... (keep all the existing imports and components until we reach the UsersTab function)

function UsersTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isBulkAddDialogOpen, setIsBulkAddDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    display_name: '',
    role: 'student',
    school_id: '',
    password: 'default123'
  });
  const [bulkUsers, setBulkUsers] = useState('');
  const { toast } = useToast();
  const { profile } = useAuth();

  // Add null check for users
  const filteredUsers = (users || []).filter(user =>
    (user?.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     user?.email?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (roleFilter === 'all' || user?.role === roleFilter)
  );

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      toast({ title: 'Error fetching users', description: error.message, variant: 'destructive' });
      setUsers([]); // Ensure we set to empty array on error
    }
    setLoading(false);
  };

  const handleAddUser = async () => {
    if (!newUser.email) {
      toast({ title: 'Email is required', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      // First create the auth user
      const { error: authError } = await supabase.auth.admin.createUser({
        email: newUser.email,
        password: newUser.password,
        email_confirm: true,
      });

      if (authError) throw authError;

      // Then create the profile
      const { error: profileError } = await supabase.from('profiles').insert([{
        user_id: `user-${Date.now()}`,
        email: newUser.email,
        display_name: newUser.display_name,
        role: newUser.role,
        school_id: newUser.school_id,
        is_active: true
      }]);

      if (profileError) throw profileError;

      toast({ title: 'User added successfully!' });
      setIsAddDialogOpen(false);
      setNewUser({
        email: '',
        display_name: '',
        role: 'student',
        school_id: '',
        password: 'default123'
      });
      fetchUsers();
    } catch (error) {
      toast({ title: 'Error adding user', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleBulkAddUsers = async () => {
    if (!bulkUsers.trim()) {
      toast({ title: 'Please enter user data', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const lines = bulkUsers.split('\n').filter(line => line.trim());
      const usersToAdd = [];

      for (const line of lines) {
        const [email, name, role = 'student', school = ''] = line.split(',').map(item => item.trim());
        if (!email) continue;

        usersToAdd.push({
          user_id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          email,
          display_name: name || email.split('@')[0],
          role: role || 'student',
          school_id: school || null,
          is_active: true
        });
      }

      const { error } = await supabase.from('profiles').insert(usersToAdd);
      if (error) throw error;

      toast({ title: `Successfully added ${usersToAdd.length} users!` });
      setIsBulkAddDialogOpen(false);
      setBulkUsers('');
      fetchUsers();
    } catch (error) {
      toast({ title: 'Error adding users', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleDeleteUser = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) throw error;

      toast({ title: 'User deleted successfully!' });
      fetchUsers();
    } catch (error) {
      toast({ title: 'Error deleting user', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
      if (error) throw error;

      toast({ title: 'Role updated successfully!' });
      fetchUsers();
    } catch (error) {
      toast({ title: 'Error updating role', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Users</h1>
          <p className="text-muted-foreground">Manage all users</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsAddDialogOpen(true)} className="gradient-hero">
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
          <Button onClick={() => setIsBulkAddDialogOpen(true)} variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Bulk Add
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users List</CardTitle>
          <CardDescription>All platform users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                  <SelectItem value="moderator">Moderators</SelectItem>
                  <SelectItem value="teacher">Teachers</SelectItem>
                  <SelectItem value="student">Students</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="text-center py-4">
                <Loader2 className="w-6 h-6 animate-spin mx-auto" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No users found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="p-3 text-left font-medium">Name</th>
                      <th className="p-3 text-left font-medium">Email</th>
                      <th className="p-3 text-left font-medium">Role</th>
                      <th className="p-3 text-left font-medium">School</th>
                      <th className="p-3 text-left font-medium">Status</th>
                      <th className="p-3 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b border-border/50 last:border-none hover:bg-muted/50 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                              {user.display_name?.split(' ').map(n => n[0]).join('') || user.email?.substring(0, 2).toUpperCase()}
                            </div>
                            <span>{user.display_name || 'No name'}</span>
                          </div>
                        </td>
                        <td className="p-3 text-muted-foreground">{user.email}</td>
                        <td className="p-3">
                          <Select
                            value={user.role}
                            onValueChange={(value) => handleRoleChange(user.id, value)}
                            disabled={user.id === profile?.id || (value === 'admin' && profile?.role !== 'admin')}
                          >
                            <SelectTrigger className="w-[120px] h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="student">Student</SelectItem>
                              <SelectItem value="teacher">Teacher</SelectItem>
                              <SelectItem value="moderator">Moderator</SelectItem>
                              {profile?.role === 'admin' && <SelectItem value="admin">Admin</SelectItem>}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-3 text-muted-foreground">{user.school_id || 'N/A'}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs capitalize ${user.is_active ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                            {user.is_active ? 'active' : 'inactive'}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
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
                                  <AlertDialogTitle>Delete User</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this user? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-destructive hover:bg-destructive/90"
                                    onClick={() => handleDeleteUser(user.id)}
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add User Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>Create a new user account</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="user@school.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Display Name</Label>
              <Input
                value={newUser.display_name}
                onChange={(e) => setNewUser({ ...newUser, display_name: e.target.value })}
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={newUser.role}
                onValueChange={(value) => setNewUser({ ...newUser, role: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                  {profile?.role === 'admin' && <SelectItem value="admin">Admin</SelectItem>}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>School ID (optional)</Label>
              <Input
                value={newUser.school_id}
                onChange={(e) => setNewUser({ ...newUser, school_id: e.target.value })}
                placeholder="school123"
              />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                placeholder="••••••••"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddUser} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add User'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Add Users Dialog */}
      <Dialog open={isBulkAddDialogOpen} onOpenChange={setIsBulkAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bulk Add Users</DialogTitle>
            <DialogDescription>Add multiple users at once (CSV format: email,name,role,school)</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>User Data</Label>
              <Textarea
                value={bulkUsers}
                onChange={(e) => setBulkUsers(e.target.value)}
                placeholder={`user1@school.com,John Doe,student,school123\nuser2@school.com,Jane Smith,teacher,school123\nuser3@school.com,Bob Johnson,moderator`}
                rows={10}
                className="font-mono"
              />
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium mb-2">Format Instructions:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• One user per line</li>
                <li>• Format: email,name,role,school</li>
                <li>• Role can be: student, teacher, moderator, admin</li>
                <li>• School is optional</li>
                <li>• Example: user@school.com,John Doe,student,school123</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBulkAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleBulkAddUsers} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Bulk Add Users'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ... (keep all the remaining components as they were)